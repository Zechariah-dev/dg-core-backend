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
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Types } from "mongoose";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { RolesGuard } from "src/guards/role.guard";
import { APP_ROLES } from ".././../..//common/interfaces/auth.interface";
import { Roles } from "../../../decorators/roles..decorator";
import { FetchProductQueryDto } from "./dtos/query.dto";

@Controller("products")
@ApiTags("Product")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(APP_ROLES.CREATOR)
  @ApiCreatedResponse({ description: "201, created product successfully" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() body: CreateProductDto,
    @Req() req: AuthRequest,
    @Query("store") store?: Types.ObjectId
  ) {
    // find existing product in user catalog
    const productExists = await this.productsService.findOne({
      title: body.title,
      seller: req.user._id,
    });

    if (productExists) {
      throw new BadRequestException("Product already exists in your catalog");
    }

    // create new product
    const product = await this.productsService.createProduct({
      ...body,
      seller: req.user._id,
      store,
    });

    return { product, message: "Product created successfully" };
  }

  @Post("/images/:id")
  @UseInterceptors(FilesInterceptor("files"))
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @ApiOkResponse({ description: "200, Product images uploaded successfully" })
  @ApiBadRequestResponse({ description: "400, Product does not exists" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const productExists = await this.productsService.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!productExists) {
      throw new BadRequestException("Product does not exists");
    }

    const images: string[] = [];

    for (const file of files) {
      const location = await this.awsS3Service.uploadImage(file);
      images.push(location);
    }

    const product = await this.productsService.update(id, req.user._id, {
      images,
    });

    return { product, message: "Product images uploaded successfully" };
  }

  @Get("/user")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @ApiOkResponse({ description: "200, fetched user products successfully" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async fetchUserProducts(
    @Query() query: FetchProductQueryDto,
    @Req() req: AuthRequest
  ) {
    const products = await this.productsService.find(
      {
        seller: req.user._id,
      },
      {},
      query
    );

    return { products, message: "User products fetched successfully" };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, fetch product successfully" })
  async fetchProducts(@Query() query: FetchProductQueryDto) {
    const products = await this.productsService.find({}, {}, query);

    return { products, message: "Product fetched successfully" };
  }

  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, product was fetched successfully" })
  @ApiNotFoundResponse({ description: "400, product does not exist" })
  async getSingleProduct(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const product = await this.productsService.findById(id);

    if (!product) {
      throw new NotFoundException("Product does not exist");
    }

    return { product, message: "Product was fetched successfully" };
  }

  @Get("/filter/:sku")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, product was fetched successfully" })
  @ApiNotFoundResponse({ description: "400, product does not exist" })
  async getProductBySku(@Param("sku") sku: string) {
    const product = await this.productsService.findOne({ sku });

    if (!product) {
      throw new NotFoundException("Product does not exist");
    }

    return { product, message: "Product was fetched successfully" };
  }

  @Delete("/user/:id")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @ApiOkResponse({
    description: "204, Product has been deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "404, Product does not exist",
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteUserProduct(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const product = await this.productsService.deleteProduct(id, req.user._id);

    if (!product) {
      throw new NotFoundException("Product does not exist");
    }

    return { message: "Product has been deleted successfully", product };
  }

  @Patch("/user/:id")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @ApiOkResponse({ description: "200, Product has been updated successfully" })
  @ApiNotFoundResponse({ description: "404, Product does not exist" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateProduct(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateProductDto,
    @Req() req: AuthRequest
  ) {
    const productExists = await this.productsService.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!productExists) {
      throw new NotFoundException("Product does not exist");
    }

    const product = await this.productsService.update(id, req.user._id, body);

    return { message: "Product has been updated sucessfully", product };
  }

  @Get("/views/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Product view count increased" })
  @ApiNotFoundResponse({ description: "404, Product does not exist" })
  async updateViewCount(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const product = await this.productsService.increaseViews(id);

    if (!product) {
      throw new NotFoundException("Product does not exist");
    }

    return { message: "Product view count increased", product };
  }

  // @Get("/recommended")
  // async getRecommendProduct(@Query() query: FetchProductQueryDto) {}
}
