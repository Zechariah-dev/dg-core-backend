import {
  Controller,
  Get,
  HttpStatus,
  Req,
  HttpCode,
  Param,
  UseGuards,
  Post,
  Delete,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FavoritesService } from "./favorites.service";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("favorites")
@ApiTags("Favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User favorites fetched successfully" })
  async getUserFavorites(@Req() req: AuthRequest) {
    const favorites = await this.favoriteService.findByUser(req.user._id);

    return { favorites, message: "User favorites fetched successfully" };
  }

  @Post("/:id")
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: "201, User favorite has been added successfully",
  })
  async addFavorite(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const favorite = await this.favoriteService.create(id, req.user._id);

    return { favorite, message: "User favorite has been added succesfully" };
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User favorite has been removed successfully",
  })
  @ApiNotFoundResponse({ description: "404, User favorite does not exist" })
  async removeFavorite(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const favorite = await this.favoriteService.remove(id, req.user._id);

    if (!favorite) {
      throw new NotFoundException("User favorite does not exist");
    }

    return { favorite, message: "User favorite has been removed successfully" };
  }

  @Get("/:id")
  async checkFavorite(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const favorite = await this.favoriteService.findOne(id, req.user._id);

    return { data: !!favorite };
  }
}
