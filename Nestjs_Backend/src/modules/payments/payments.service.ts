import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const StripeLib: new (key: string) => any = require('stripe');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly pawaPayBaseUrl: string;
  private readonly pawaPayToken: string;
  private readonly pawaPayWebhookSecret: string;

  private readonly stripe: any;

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

    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = stripeKey ? new StripeLib(stripeKey) : null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SAVED PAYMENT METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  async listSavedMethods(userId: string) {
    return this.prisma.savedPaymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        label: true,
        isDefault: true,
        msisdn: true,
        mobileProvider: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        createdAt: true,
      },
    });
  }

  async saveMobileMoney(
    userId: string,
    data: { msisdn: string; label?: string },
  ) {
    const provider = this.getCorrespondent(data.msisdn);
    const label =
      data.label || (provider === 'MTN_MOMO_CMR' ? 'MTN MoMo' : 'Orange Money');

    // Limit: 5 saved methods per user
    const count = await this.prisma.savedPaymentMethod.count({
      where: { userId },
    });
    if (count >= 5)
      throw new BadRequestException('Maximum 5 saved payment methods allowed');

    const isFirst = count === 0;

    return this.prisma.savedPaymentMethod.create({
      data: {
        userId,
        type: 'MOBILE_MONEY',
        label,
        msisdn: data.msisdn,
        mobileProvider: provider,
        isDefault: isFirst,
      },
      select: {
        id: true,
        type: true,
        label: true,
        isDefault: true,
        msisdn: true,
        mobileProvider: true,
        createdAt: true,
      },
    });
  }

  async createStripeSetupIntent(userId: string) {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }

    // Get or create Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, stripeCustomerId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email || undefined,
        metadata: { eazypostUserId: userId },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return { clientSecret: setupIntent.client_secret };
  }

  async saveCard(
    userId: string,
    data: { stripePaymentMethodId: string; label?: string },
  ) {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }

    // Retrieve PM from Stripe to get card details
    const pm = await this.stripe.paymentMethods.retrieve(
      data.stripePaymentMethodId,
    );
    if (!pm.card) throw new BadRequestException('Not a card payment method');

    const count = await this.prisma.savedPaymentMethod.count({
      where: { userId },
    });
    if (count >= 5)
      throw new BadRequestException('Maximum 5 saved payment methods allowed');

    const isFirst = count === 0;

    return this.prisma.savedPaymentMethod.create({
      data: {
        userId,
        type: 'CARD',
        label:
          data.label || `${pm.card.brand.toUpperCase()} ····${pm.card.last4}`,
        stripePaymentMethodId: data.stripePaymentMethodId,
        last4: pm.card.last4,
        brand: pm.card.brand,
        expiryMonth: pm.card.exp_month,
        expiryYear: pm.card.exp_year,
        isDefault: isFirst,
      },
      select: {
        id: true,
        type: true,
        label: true,
        isDefault: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        createdAt: true,
      },
    });
  }

  async setDefaultMethod(userId: string, methodId: string) {
    const method = await this.prisma.savedPaymentMethod.findFirst({
      where: { id: methodId, userId },
    });
    if (!method) throw new NotFoundException('Payment method not found');

    await this.prisma.$transaction([
      this.prisma.savedPaymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.savedPaymentMethod.update({
        where: { id: methodId },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  }

  async deleteSavedMethod(userId: string, methodId: string) {
    const method = await this.prisma.savedPaymentMethod.findFirst({
      where: { id: methodId, userId },
    });
    if (!method) throw new NotFoundException('Payment method not found');

    // If deleting default, promote next one
    if (method.isDefault) {
      const next = await this.prisma.savedPaymentMethod.findFirst({
        where: { userId, id: { not: methodId } },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.savedPaymentMethod.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    // If card: detach from Stripe
    if (method.stripePaymentMethodId && this.stripe) {
      await this.stripe.paymentMethods
        .detach(method.stripePaymentMethodId)
        .catch(() => {});
    }

    await this.prisma.savedPaymentMethod.delete({ where: { id: methodId } });
    return { success: true };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAWAPAY DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  async initiateDeposit(
    userId: string,
    data: {
      planType: any;
      amount: number;
      phone: string;
      billingCycle: string;
      operator?: string;
      savedMethodId?: string;
    },
  ) {
    // If using a saved method, resolve the phone
    let phone = data.phone;
    if (data.savedMethodId) {
      const saved = await this.prisma.savedPaymentMethod.findFirst({
        where: { id: data.savedMethodId, userId, type: 'MOBILE_MONEY' },
      });
      if (!saved?.msisdn)
        throw new BadRequestException(
          'Saved method not found or has no MSISDN',
        );
      phone = saved.msisdn;
    }

    const depositId = uuidv4();

    const transaction = await this.prisma.transaction.create({
      data: {
        id: depositId,
        userId,
        amount: data.amount,
        planType: data.planType,
        billingCycle: data.billingCycle,
        status: 'PENDING',
        provider: 'PAWAPAY',
        metadata: { phone },
      },
    });

    try {
      const response = await axios.post(
        `${this.pawaPayBaseUrl}/deposits`,
        {
          depositId,
          amount: data.amount.toString(),
          currency: 'XAF',
          country: 'CMR',
          correspondent: data.operator || this.getCorrespondent(phone),
          payer: {
            type: 'MSISDN',
            address: { value: phone },
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

      if (response.data.status === 'REJECTED') {
        await this.prisma.transaction.update({
          where: { id: depositId },
          data: { status: 'FAILED' },
        });
        const reason =
          response.data.rejectionReason?.rejectionCode || 'REJECTED';
        throw new InternalServerErrorException(`PawaPay rejected: ${reason}`);
      }

      return {
        transactionId: transaction.id,
        pawaPayStatus: response.data.status,
        message:
          'Payment initiated. Please check your phone for the PIN prompt.',
      };
    } catch (error) {
      const pawaPayError = error.response?.data;
      console.error(
        'PawaPay Error:',
        JSON.stringify(pawaPayError || error.message),
      );
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

  async getStatus(
    transactionId: string,
  ): Promise<{ status: string; failureCode?: string }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, metadata: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');

    const meta = transaction.metadata as Record<string, string> | null;
    return {
      status: transaction.status,
      ...(meta?.failureCode ? { failureCode: meta.failureCode } : {}),
    };
  }

  verifyWebhookSecret(authHeader: string | undefined): void {
    if (!this.pawaPayWebhookSecret) return;
    const token = authHeader?.replace('Bearer ', '').trim();
    if (token !== this.pawaPayWebhookSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAWAPAY POLLING FALLBACK
  // Runs every minute to catch transactions where the webhook never arrived.
  // Only checks transactions older than 2 minutes so we don't race the webhook.
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async pollPendingTransactions() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const pending = await this.prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        provider: 'PAWAPAY',
        createdAt: { lte: twoMinutesAgo },
      },
      take: 20,
    });

    if (pending.length === 0) return;
    this.logger.log(
      `Polling PawaPay for ${pending.length} pending transaction(s)`,
    );

    for (const tx of pending) {
      try {
        const res = await axios.get(
          `${this.pawaPayBaseUrl}/deposits/${tx.id}`,
          {
            headers: { Authorization: `Bearer ${this.pawaPayToken}` },
            timeout: 10_000,
          },
        );
        const deposit = Array.isArray(res.data) ? res.data[0] : res.data;
        const status: string = deposit?.status;

        if (
          status === 'COMPLETED' ||
          status === 'FAILED' ||
          status === 'REJECTED'
        ) {
          this.logger.log(`PawaPay poll: transaction ${tx.id} → ${status}`);
          await this.handleWebhook({
            depositId: tx.id,
            status,
            failureReason: deposit?.failureReason,
          });
        }
      } catch (err) {
        this.logger.error(`PawaPay poll error for ${tx.id}: ${err.message}`);
      }
    }
  }

  async handleWebhook(payload: any) {
    const { depositId, status } = payload;
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: depositId },
    });
    if (!transaction) return;

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
        data: { planType: transaction.planType, planExpiresAt: expiresAt },
      });
    } else if (status === 'FAILED' || status === 'REJECTED') {
      const failureCode = payload.failureReason?.failureCode || 'UNKNOWN';
      const failureMessage = payload.failureReason?.failureMessage || '';
      await this.prisma.transaction.update({
        where: { id: depositId },
        data: {
          status: 'FAILED',
          metadata: {
            ...(transaction.metadata as object),
            failureCode,
            failureMessage,
          },
        },
      });
    }

    return { received: true };
  }

  private getCorrespondent(phone: string): string {
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
