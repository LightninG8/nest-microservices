import { IsNumber, IsString } from 'class-validator';
export type PaymentStatus = 'canceled' | 'success' | 'progress';

export namespace PaymentCheck {
  export const topic = 'payment.check.command';

  export class Request {
    @IsString()
    courseId: string;

    @IsString()
    userId: string;
  }

  export class Response {
    status: PaymentStatus;
  }
}
