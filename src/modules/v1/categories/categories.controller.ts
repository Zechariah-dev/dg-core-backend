import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { UpdateCategoryDto } from "./dtos/update-category.dto";

@Controller("categories")
@ApiTags("Categories")
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "fetch categories successfully" })
  async getCategories(
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 6
  ) {
    const categories = await this.categoriesService.find({}, null, page, limit);

    return { categories, message: "Categories has been fetched successfully" };
  }

  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Category has been fetched succesfully" })
  @ApiNotFoundResponse({ description: "404, Category does not existI"})
  async getSingleCategory(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const category = await this.categoriesService.findById(id);

    if (!category) {
      throw new NotFoundException("Category does not exist");
    }

    return { category, message: "Category has been fetched successfully" };
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "201, category created successfully" })
  async createCategory(
    @UploadedFile() image: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    const { name } = createCategoryDto;

    const categoryExists = await this.categoriesService.findByName(name);
    if (categoryExists) {
      if (!categoryExists.deletedAt) {
        throw new BadRequestException("Category already exists");
      } else {
        const location = await this.awsS3Service.uploadImage(image);
        const updatedCategory = await this.categoriesService.update(
          categoryExists._id,
          { image: location, deletedAt: null }
        );

        return {
          updatedCategory,
          message: "Category has been created successfully",
        };
      }
    }

    const location = await this.awsS3Service.uploadImage(image);

    const category = await this.categoriesService.create({
      ...createCategoryDto,
      image: location,
    });

    return { category, message: "Category has been created sucessfully" };
  }

  @Patch("/:id")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("image"))
  @ApiOkResponse({ description: "200, category updated successfully" })
  async updateCategory(
    @UploadedFile() image: Express.Multer.File,
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const categoryExists = await this.categoriesService.findById(id);

    if (!categoryExists) {
      throw new BadRequestException("Category does not exist");
    }

    const updatedFields = updateCategoryDto;

    if (image) {
      const location = await this.awsS3Service.uploadImage(image);
      updatedFields.image = location;
    }

    const category = await this.categoriesService.update(id, updatedFields);

    return { category, message: "Category has been updated successfully" };
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, category deleted successfully" })
  @ApiNotFoundResponse({ description: "400, category does not exist" })
  async deleteCategory(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const category = await this.categoriesService.softDelete(id);

    if (!category) {
      throw new NotFoundException("Category does not exist");
    }

    return { category, message: "Category has been deleted successfully" };
  }

  @Get("/search")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, categories searched successfully" })
  async searchCategory(@Query("query") query: string) {
    const categories = await this.categoriesService.search(query);

    return { categories, message: "Categories searched successfully" };
  }
}
