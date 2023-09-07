import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CacUploadDto {
  @IsString()
  @ApiProperty()
  cacNumber: string;
}
