import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { APPROVAL_STATUS } from "../../../../constants";

export class UpdateForumDto {
  @IsString()
  @IsEnum(APPROVAL_STATUS)
  @ApiProperty()
  approvalStatus: string;

  @IsString()
  @ApiProperty()
  approvalMessage: string;
}
