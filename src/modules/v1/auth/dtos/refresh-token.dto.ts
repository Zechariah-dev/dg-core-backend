import { ApiProperty } from "@nestjs/swagger";
import { IsJWT } from "class-validator";

export class RefreshTokenDto {
  @IsJWT()
  @ApiProperty()
  token: string;
}
