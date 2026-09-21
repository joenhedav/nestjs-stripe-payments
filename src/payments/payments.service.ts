import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config/envs';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { throws } from 'assert';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe = new Stripe(envs.STRIPE_SECRET);

  async createPaymentSession(dto: CreatePaymentSessionDto) {
    const { orderId, currency, items } = dto;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: envs.STRIPE_SUCCESS_URL,
      cancel_url: envs.STRIPE_CANCEL_URL,
      payment_intent_data: {
        metadata: { orderId },
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        envs.STRIPE_ENDPOINT_SECRET,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknow error';
      throw new BadRequestException(`Webhook error: ${message}`)
    }
  }

  handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        const orderId = charge.metadata?.orderId;
        this.logger.log(`Pago confirmado para orderId=${orderId}`);
        break;
      }
      default:
        this.logger.log(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }
}
