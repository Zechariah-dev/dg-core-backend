import { StoresService } from "./stores.service";
import {
  BadRequestException,
  Body,
  Get,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  Delete,
  Param,
  NotFoundException,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CreateStoreDto } from "./dtos/create-store.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../../../decorators/roles..decorator";
import { APP_ROLES } from "../../../common/interfaces/auth.interface";
import { RolesGuard } from "../../../guards/role.guard";
import { FetchStoreQueryDto } from "./dtos/query.dto";
import { Types } from "mongoose";
import { UpdateStoreDto } from "./dtos/update-store.dto";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AwsS3Service } from "../../../common/services/aws-s3.service";

@Controller("stores")
@ApiTags("Store")
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({
    description: "401, Your account is yet to be approved",
  })
  @ApiBadRequestResponse({ description: "400, Store name is already in use" })
  @ApiCreatedResponse({ description: "201, Usr store created successfully" })
  async createStore(
    @Body() createStoreBody: CreateStoreDto,
    @Req() req: AuthRequest
  ) {
    if (!req.user.business.isApproved) {
      throw new UnauthorizedException("Your account is yet to be approved");
    }

    const storeExists = await this.storesService.findOne({
      name: createStoreBody.name,
    });

    if (storeExists) {
      throw new BadRequestException("Store name is already in use");
    }

    const store = await this.storesService.create(
      createStoreBody,
      req.user._id
    );

    return { store, message: "User Store created successfully" };
  }

  @Post("/images/:id")
  @HttpCode(HttpStatus.CREATED)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "coverImage",
        maxCount: 1,
      },
      {
        name: "image",
        maxCount: 1,
      },
    ])
  )
  @ApiBadRequestResponse({ description: "400, Store doesn't exist" })
  @ApiOkResponse({ description: "200, User store updated successfully" })
  async uploadStoreImages(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @UploadedFiles()
    files: { coverImage: Express.Multer.File[]; image: Express.Multer.File[] },
    @Req() req: AuthRequest
  ) {
    const storeExists = await this.storesService.findOne({
      _id: id,
      creator: req.user._id,
    });

    if (!storeExists) {
      throw new BadRequestException("Store doesn't exist");
    }
    const payload = {};

    if (files.coverImage) {
      const link = await this.awsS3Service.uploadImage(files.coverImage[0]);
      Object.assign(payload, { coverImage: link });
    }

    if (files.image) {
      const link = await this.awsS3Service.uploadImage(files.image[0]);
      Object.assign(payload, { image: link });
    }

    const store = await this.storesService.update(id, req.user._id, {
      ...payload,
    });

    return { message: "User store updated successfully", store };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ description: "200, User stores fetched successfully" })
  async getUserStores(
    @Query() query: FetchStoreQueryDto,
    @Req() req: AuthRequest
  ) {
    const stores = await this.storesService.find(
      { creator: req.user._id },
      null,
      query
    );

    return { stores, message: "User store fetched successfully" };
  }

  @Patch("/:id")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiNotFoundResponse({ description: "404, Store does not exist" })
  @ApiOkResponse({ description: "User store updated successfully" })
  async updateStore(
    @Param("id") id: Types.ObjectId,
    @Body() updateStorePayload: UpdateStoreDto,
    @Req() req: AuthRequest
  ) {
    if (updateStorePayload.creatorTag) {
      const tagExists = await this.storesService.findByCreatorTag(
        updateStorePayload?.creatorTag
      );

      if (tagExists && tagExists._id.toString() !== id.toString()) {
        throw new BadRequestException(
          "Store creatorTag already in use, kindly pick another"
        );
      }
    }

    const store = await this.storesService.update(
      id,
      req.user._id,
      updateStorePayload
    );

    if (!store) {
      throw new NotFoundException("Store does not exist");
    }

    return { store, message: "User store updated successfully" };
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiNotFoundResponse({ description: "404, Store does not exist" })
  @ApiOkResponse({ description: "User store deleted successfully" })
  async deleteStore(@Param("id") id: Types.ObjectId, @Req() req: AuthRequest) {
    const store = await this.storesService.delete(id, req.user._id);

    if (!store) {
      throw new NotFoundException("Store does not exist");
    }

    return { store, message: "User store deleted successfully" };
  }

  @Get("/products/:id")
  async getStoreProducts(@Param("id") id: Types.ObjectId) {
    const store = await this.storesService.findById(id);
    if (!store) {
      throw new NotFoundException("Store does not exist");
    }

    const products = await this.storesService.findProductsByStore(id);

    return { products, message: "Store products fetched successfully" };
  }
}
