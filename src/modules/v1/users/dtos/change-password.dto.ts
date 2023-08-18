import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  newPassword: string;
}
