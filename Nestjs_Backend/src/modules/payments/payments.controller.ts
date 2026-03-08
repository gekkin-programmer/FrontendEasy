import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a mobile money deposit via PawaPay' })
  initiatePayment(
    @Req() req,
    @Body()
    body: {
      planType: string;
      amount: number;
      phone: string;
      billingCycle: string;
    },
  ) {
    return this.paymentsService.initiateDeposit(req.user.sub, body);
  }

  @Post('webhook/pawapay')
  @ApiOperation({ summary: 'Webhook handler for PawaPay notifications' })
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }
}
