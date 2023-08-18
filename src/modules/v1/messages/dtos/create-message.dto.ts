import { IsNotEmpty, IsString } from "class-validator";

export class createMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
