import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly pawaPayBaseUrl: string;
  private readonly pawaPayToken: string;
  private readonly pawaPayWebhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.pawaPayBaseUrl =
      this.configService.get<string>('PAWAPAY_BASE_URL') ||
      'https://api.pawapay.io';
    this.pawaPayToken =
      this.configService.get<string>('PAWAPAY_API_TOKEN') || '';
    this.pawaPayWebhookSecret =
      this.configService.get<string>('PAWAPAY_WEBHOOK_SECRET') || '';
  }

  async initiateDeposit(
    userId: string,
    data: {
      planType: any;
      amount: number;
      phone: string;
      billingCycle: string;
      operator?: string;
    },
  ) {
    const depositId = uuidv4();

    // 1. Create PENDING transaction in DB
    const transaction = await this.prisma.transaction.create({
      data: {
        id: depositId,
        userId,
        amount: data.amount,
        planType: data.planType,
        billingCycle: data.billingCycle,
        status: 'PENDING',
        provider: 'PAWAPAY',
        metadata: { phone: data.phone },
      },
    });

    // 2. Call PawaPay API
    // Documentation: https://docs.pawapay.io/
    try {
      const response = await axios.post(
        `${this.pawaPayBaseUrl}/deposits`,
        {
          depositId: depositId,
          amount: data.amount.toString(),
          currency: 'XAF',
          country: 'CMR',
          correspondent: data.operator || this.getCorrespondent(data.phone),
          payer: {
            type: 'MSISDN',
            address: { value: data.phone },
          },
          customerTimestamp: new Date().toISOString(),
          statementDescription: `EasyPost ${data.planType}`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.pawaPayToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'REJECTED') {
        await this.prisma.transaction.update({
          where: { id: depositId },
          data: { status: 'FAILED' },
        });
        const reason = response.data.rejectionReason?.rejectionCode || 'REJECTED';
        throw new InternalServerErrorException(`PawaPay rejected: ${reason}`);
      }

      return {
        transactionId: transaction.id,
        pawaPayStatus: response.data.status,
        message: 'Payment initiated. Please check your phone for the PIN prompt.',
      };
    } catch (error) {
      const pawaPayError = error.response?.data;
      console.error('PawaPay Error:', JSON.stringify(pawaPayError || error.message));

      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });

      throw new InternalServerErrorException(
        pawaPayError
          ? `PawaPay: ${JSON.stringify(pawaPayError)}`
          : 'Could not initiate payment with PawaPay',
      );
    }
  }

  async getStatus(transactionId: string): Promise<{ status: string; failureCode?: string }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, metadata: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const meta = transaction.metadata as Record<string, string> | null;
    return {
      status: transaction.status,
      ...(meta?.failureCode ? { failureCode: meta.failureCode } : {}),
    };
  }

  // Handle Webhook from PawaPay
  // PawaPay sends Authorization: Bearer <PAWAPAY_WEBHOOK_SECRET> on every callback.
  // Configure the same secret in your PawaPay dashboard under Callback Auth Token.
  verifyWebhookSecret(authHeader: string | undefined): void {
    if (!this.pawaPayWebhookSecret) return; // skip if secret not configured
    const token = authHeader?.replace('Bearer ', '').trim();
    if (token !== this.pawaPayWebhookSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
  }

  async handleWebhook(payload: any) {
    const { depositId, status } = payload;

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: depositId },
    });

    if (!transaction) return;

    if (status === 'COMPLETED') {
      // 1. Mark transaction as COMPLETED
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'COMPLETED' },
      });

      // 2. Calculate expiration date
      const expiresAt =
        transaction.billingCycle === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 3. Update User Plan
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: {
          planType: transaction.planType,
          planExpiresAt: expiresAt,
        },
      });
    } else if (status === 'FAILED' || status === 'REJECTED') {
      const failureCode = payload.failureReason?.failureCode || 'UNKNOWN';
      const failureMessage = payload.failureReason?.failureMessage || '';
      console.error(`PawaPay deposit FAILED [${depositId}]: ${failureCode} — ${failureMessage}`);
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: {
          status: 'FAILED',
          metadata: { ...(transaction.metadata as object), failureCode, failureMessage },
        },
      });
    }

    return { received: true };
  }

  private getCorrespondent(phone: string): string {
    // MTN Cameroon prefixes: 650-654, 67x, 68x
    // Orange Cameroon prefixes: 655-659, 69x
    if (
      phone.startsWith('23767') ||
      phone.startsWith('23768') ||
      phone.startsWith('237650') ||
      phone.startsWith('237651') ||
      phone.startsWith('237652') ||
      phone.startsWith('237653') ||
      phone.startsWith('237654')
    )
      return 'MTN_MOMO_CMR';
    return 'ORANGE_CMR';
  }
}
