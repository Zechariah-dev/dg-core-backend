import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CacUploadDto {
  @IsString()
  @ApiProperty()
  cacNumber: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  name: string;
}
