import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
