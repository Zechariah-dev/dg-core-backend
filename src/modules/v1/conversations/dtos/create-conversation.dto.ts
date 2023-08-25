import { IsNotEmpty, IsString } from "class-validator";

export class createConversationDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
