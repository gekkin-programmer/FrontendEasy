import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Saved Payment Methods ────────────────────────────────────────────────

  @Get('methods')
  @ApiOperation({ summary: 'List saved payment methods for current user' })
  listMethods(@Req() req) {
    return this.paymentsService.listSavedMethods(req.user.sub);
  }

  @Post('methods/mobile-money')
  @ApiOperation({ summary: 'Save a mobile money number (Orange / MTN)' })
  saveMobileMoney(
    @Req() req,
    @Body() body: { msisdn: string; label?: string },
  ) {
    return this.paymentsService.saveMobileMoney(req.user.sub, body);
  }

  @Post('methods/card/setup-intent')
  @ApiOperation({
    summary: 'Create a Stripe SetupIntent to collect card details',
  })
  createSetupIntent(@Req() req) {
    return this.paymentsService.createStripeSetupIntent(req.user.sub);
  }

  @Post('methods/card/confirm')
  @ApiOperation({ summary: 'Save a confirmed Stripe card payment method' })
  saveCard(
    @Req() req,
    @Body() body: { stripePaymentMethodId: string; label?: string },
  ) {
    return this.paymentsService.saveCard(req.user.sub, body);
  }

  @Patch('methods/:id/default')
  @ApiOperation({ summary: 'Set a saved method as default' })
  setDefault(@Req() req, @Param('id') id: string) {
    return this.paymentsService.setDefaultMethod(req.user.sub, id);
  }

  @Delete('methods/:id')
  @ApiOperation({ summary: 'Delete a saved payment method' })
  deleteMethod(@Req() req, @Param('id') id: string) {
    return this.paymentsService.deleteSavedMethod(req.user.sub, id);
  }

  // ─── Deposits ────────────────────────────────────────────────────────────

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a mobile money deposit via PawaPay' })
  initiatePayment(
    @Req() req,
    @Body()
    body: {
      planType: string;
      amount: number;
      phone: string;
      billingCycle: string;
      operator?: string;
      savedMethodId?: string;
    },
  ) {
    return this.paymentsService.initiateDeposit(req.user.sub, body);
  }

  @Get('status/:transactionId')
  @ApiOperation({ summary: 'Poll payment status by transaction ID' })
  getStatus(@Param('transactionId') transactionId: string) {
    return this.paymentsService.getStatus(transactionId);
  }

  @Post('webhook/pawapay')
  @Public()
  @ApiOperation({
    summary: 'Webhook handler for PawaPay deposit notifications',
  })
  handleWebhook(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    this.paymentsService.verifyWebhookSecret(authHeader);
    return this.paymentsService.handleWebhook(body);
  }
}
