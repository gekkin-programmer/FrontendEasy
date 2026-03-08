import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    // Pawapay configuration (Sandbox or Production)
    this.pawaPayBaseUrl = 'https://api.pawapay.cloud/v1'; // Standard URL
    this.pawaPayToken =
      this.configService.get<string>('PAWAPAY_API_TOKEN') || '';
  }

  async initiateDeposit(
    userId: string,
    data: {
      planType: any;
      amount: number;
      phone: string;
      billingCycle: string;
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
          country: 'CM', // Default to Cameroon, can be dynamic
          correspondent: this.getCorrespondent(data.phone),
          payer: {
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

      // Update transaction status if initiation failed
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });

      throw new InternalServerErrorException(
        'Could not initiate payment with PawaPay',
      );
    }
  }

  // Handle Webhook from PawaPay
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
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });
    }

    return { received: true };
  }

  private getCorrespondent(phone: string): string {
    // Simple logic to detect MTN or ORANGE in Cameroon
    // 67, 68, 650-654 = MTN
    // 69, 655-659 = ORANGE
    if (
      phone.startsWith('23767') ||
      phone.startsWith('23768') ||
      phone.startsWith('237650')
    )
      return 'MTN_MOMO_CM';
    return 'ORANGE_MONEY_CM';
  }
}
