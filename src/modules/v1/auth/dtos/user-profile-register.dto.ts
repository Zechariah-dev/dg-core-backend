import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsPhoneNumber, IsString } from "class-validator";

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

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  businessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  businessAddress: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  identificationType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  identificationNumber: string;
}
