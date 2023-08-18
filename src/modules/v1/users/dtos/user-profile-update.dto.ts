import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from "class-validator";

export class UserProfileUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  fullname: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  @ApiPropertyOptional()
  dateOfBirth: Date;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  languages: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  gender: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  city: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  state: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  address: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional()
  phone: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  username: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  businessTag: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bio: string;
}
