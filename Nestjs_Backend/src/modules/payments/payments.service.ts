import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly pawaPayBaseUrl: string;
  private readonly pawaPayToken: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.pawaPayBaseUrl = 'https://api.pawapay.cloud/v1';
    this.pawaPayToken =
      this.configService.get<string>('PAWAPAY_API_TOKEN') || '';
  }

  async initiateDeposit(
    userId: string,
    data: {
      planType: any;
      amount: number;
      phone: string;
      operator: string;
      billingCycle: string;
    },
  ) {
    const depositId = uuidv4();
    const correspondent = this.getCorrespondent(data.phone, data.operator);

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
        metadata: { phone: data.phone, operator: correspondent },
      },
    });

    // 2. Call PawaPay Deposits API
    try {
      const response = await axios.post(
        `${this.pawaPayBaseUrl}/deposits`,
        {
          depositId,
          amount: data.amount.toString(),
          currency: 'XAF',
          country: 'CMR',
          correspondent,
          payer: {
            type: 'MSISDN',
            address: { value: data.phone },
          },
          customerTimestamp: new Date().toISOString(),
          statementDescription: `EazyPost ${data.planType}`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.pawaPayToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        transactionId: transaction.id,
        pawaPayStatus: response.data.status,
        message:
          'Payment initiated. Please check your phone for the PIN prompt.',
      };
    } catch (error) {
      console.error('PawaPay Error:', error.response?.data || error.message);

      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });

      throw new InternalServerErrorException(
        error.response?.data?.message ||
          'Could not initiate payment with PawaPay',
      );
    }
  }

  async getTransactionStatus(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: { status: true, planType: true, billingCycle: true, amount: true },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  // Handle Webhook from PawaPay
  async handleWebhook(payload: any) {
    const { depositId, status } = payload;

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: depositId },
    });

    if (!transaction) return { received: true };

    if (status === 'COMPLETED') {
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'COMPLETED' },
      });

      const expiresAt =
        transaction.billingCycle === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: {
          planType: transaction.planType,
          planExpiresAt: expiresAt,
        },
      });
    } else if (status === 'FAILED' || status === 'REJECTED') {
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });
    }

    return { received: true };
  }

  // Map frontend operator key → PawaPay correspondent code
  private getCorrespondent(phone: string, operator?: string): string {
    if (operator === 'MTN_MOMO_CM') return 'MTN_MOMO_CMR';
    if (operator === 'ORANGE_MONEY_CM') return 'ORANGE_CMR';

    // Fallback: detect from Cameroonian phone prefix
    // MTN: 67x, 68x, 650-654
    const local = phone.replace(/^237/, '');
    if (
      local.startsWith('67') ||
      local.startsWith('68') ||
      /^65[0-4]/.test(local)
    ) {
      return 'MTN_MOMO_CMR';
    }
    return 'ORANGE_CMR';
  }
}
