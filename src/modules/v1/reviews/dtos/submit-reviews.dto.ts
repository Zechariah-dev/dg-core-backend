import {ApiProperty} from "@nestjs/swagger";
import {IsArray, MinLength} from "class-validator";

export class SubmitReviewsDto {
    @IsArray({ })
    @ApiProperty()
    reviews: { product: string, rating: number }[]
}