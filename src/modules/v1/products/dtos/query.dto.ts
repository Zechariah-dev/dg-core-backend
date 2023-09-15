import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FetchProductQueryDto {
  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  @ApiProperty({ type: "number", required: false })
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  @ApiProperty({ type: "number", required: false })
  limit?: number = 1;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  category?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  section?: string;

  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  @ApiProperty({ type: "number", required: false })
  rating?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  sort?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  productId: string;
}
