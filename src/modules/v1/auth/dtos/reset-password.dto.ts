import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
