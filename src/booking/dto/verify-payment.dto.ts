import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export enum PaymentStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}

export class VerifyPayment {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    bookingId : string

    @ApiProperty()
    @IsEnum(PaymentStatus)
    @IsNotEmpty()
    paymentStatus : PaymentStatus
}