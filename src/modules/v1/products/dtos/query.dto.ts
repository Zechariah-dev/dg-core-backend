import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FetchProductQueryDto {
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
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;


  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  date?: string;
}
