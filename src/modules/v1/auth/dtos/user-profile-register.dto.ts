import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString } from "class-validator";

export class UserProfileRegisterDto {
  @IsPhoneNumber()
  @ApiProperty()
  phone: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  country: string;
}
