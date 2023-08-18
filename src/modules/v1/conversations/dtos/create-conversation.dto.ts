import { IsNotEmpty, IsString } from "class-validator";

export class createConversationDto {
  @IsString()
  @IsNotEmpty()
  reciepentId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
