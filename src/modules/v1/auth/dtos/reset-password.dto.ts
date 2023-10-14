import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class UpdatePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;


  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
