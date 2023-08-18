import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";

class Collaborator {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  role: string;
}

class Personalization {
  @IsString()
  @ApiProperty()
  instruction: string;

  @IsBoolean()
  @ApiProperty()
  isOptional: boolean;
}

class Variant {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  color: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  size: string;

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;

  @IsBoolean()
  @ApiProperty()
  isVisible: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  price: number;

  @IsString()
  @ApiProperty()
  type: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;

  @IsArray()
  @ArrayMaxSize(10)
  @ApiProperty()
  tags: string[];

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional()
  personalization: Personalization;

  @IsArray()
  @ValidateNested()
  collaborationPartners: Collaborator[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @ApiPropertyOptional()
  variation: Variant[];

  @IsArray()
  sections: string[];

  @IsArray()
  @IsNotEmpty()
  categories: Types.ObjectId[];
}

export class CreateProductPayload extends CreateProductDto {
  seller: Types.ObjectId;
}
