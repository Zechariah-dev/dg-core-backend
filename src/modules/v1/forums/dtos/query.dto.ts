import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class FetchForumsQueryDto {
  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform((prop) => Number(prop.value))
  limit?: number = 1;
}
