import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FetchUsersQueryDto {
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
  role?: string;
}
