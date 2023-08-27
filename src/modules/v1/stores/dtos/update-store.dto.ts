import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;
}
