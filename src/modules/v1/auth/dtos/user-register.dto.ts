import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from "class-validator";
import { APP_ROLES } from "../../../../common/interfaces/auth.interface";

export class UserRegisterDto {
  @IsString()
  @ApiProperty()
  fullname: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;

  @IsString()
  @IsEnum(APP_ROLES)
  @ApiProperty()
  role: string;

  @IsBoolean()
  termsAndCondition: boolean = true;
}
