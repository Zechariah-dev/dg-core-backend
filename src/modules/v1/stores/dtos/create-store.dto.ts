import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateStoreDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  bio: string;

  @IsArray()
  @IsOptional()
  @ApiProperty()
  categories: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty()
  languages: string[];

  @IsString()
  @IsOptional()
  @ApiProperty()
  creatorTag: string;
}
