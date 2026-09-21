import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentSessionItemDto } from './payment-session-item.dto';

export class CreatePaymentSessionDto {
  @IsString()
  public orderId: string;

  @IsString()
  public currency: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSessionItemDto)
  public items: PaymentSessionItemDto[];
}
