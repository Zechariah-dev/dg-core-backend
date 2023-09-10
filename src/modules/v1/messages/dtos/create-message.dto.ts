import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";

export class createMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsString()
  @IsOptional()
  @Transform((val) => new ObjectId(val.value))
  @ApiProperty({
    required: false,
  })
  product: Types.ObjectId;
}
