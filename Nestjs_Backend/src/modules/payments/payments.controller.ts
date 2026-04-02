import {
  Controller,
  Post,
  Get,
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
      operator?: string;
    },
  ) {
    return this.paymentsService.initiateDeposit(req.user.sub, body);
  }

  @Get('status/:transactionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
