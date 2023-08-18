import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dtos/create-review.dto";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import ParseObjectIdPipe from "src/pipes/parse-object-id.pipe";
import { Types } from "mongoose";

@Controller("reviews")
@ApiTags("Reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "201, review was created successfully" })
  @UseGuards(JwtAuthGuard)
  async createReview(@Body() body: CreateReviewDto, @Req() req: AuthRequest) {
    const review = await this.reviewsService.create({
      ...body,
      user: req.user._id,
    });

    return { review, message: "Review was created successfully" };
  }

  @Get("/product/:productId")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, Product reviews  was fetched successfuly",
  })
  async getProductReviews(
    @Param("productId", ParseObjectIdPipe) productId: Types.ObjectId
  ) {
    const reviews = await this.reviewsService.fetchProductReviews(productId);

    return { reviews, message: "Product reviews was fetched successfully" };
  }

  @Get("/user")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User reviews was fetched successfully" })
  @UseGuards(JwtAuthGuard)
  async getUserReviews(@Req() req: AuthRequest) {
    const reviews = await this.reviewsService.fethUserReviews(req.user._id);

    return { reviews, message: "User reviews was fetched successfully" };
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Review has been deleted successfully" })
  @ApiNotFoundResponse({ description: "400, Review does not exist" })
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const review = await this.reviewsService.delete(id);

    if (!review) {
      throw new NotFoundException("Review does not exist");
    }

    return { message: "Review has been deleted successfully" };
  }
}
