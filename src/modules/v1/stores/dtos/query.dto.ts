import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FetchStoreQueryDto {
  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  limit?: number = 1;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  date?: string;
}
