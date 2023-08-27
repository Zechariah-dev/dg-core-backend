import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateStoreDto {
  @IsString()
  @ApiProperty()
  name: string;
}
