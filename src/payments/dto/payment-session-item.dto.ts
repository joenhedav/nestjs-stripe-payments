import { IsPositive, IsString } from 'class-validator';

export class PaymentSessionItemDto {
  @IsString()
  public name: string;

  @IsPositive()
  public price: number;

  @IsPositive()
  public quantity: number;
}
