import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, ValidateNested } from "class-validator";

class Notification {
  @IsBoolean()
  @ApiProperty()
  email: boolean;

  @IsBoolean()
  @ApiProperty()
  pushNotification: boolean;
}
export class UpdateUserSettingDto {
  @ValidateNested()
  @ApiProperty()
  notification: Notification;
}
