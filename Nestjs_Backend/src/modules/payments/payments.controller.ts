import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
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
      operator: string;
      billingCycle: string;
    },
  ) {
    return this.paymentsService.initiateDeposit(req.user.sub, body);
  }

  @Get('status/:transactionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Poll transaction status' })
  getStatus(@Param('transactionId') transactionId: string, @Req() req) {
    return this.paymentsService.getTransactionStatus(
      transactionId,
      req.user.sub,
    );
  }

  @Post('webhook/pawapay')
  @ApiOperation({ summary: 'Webhook handler for PawaPay notifications' })
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }
}
