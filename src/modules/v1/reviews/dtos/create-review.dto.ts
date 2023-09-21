import { IsNumber, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  creator: string;
}
