import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Favorite, FavoriteDocument } from "./schemas/favorite.schema";

export class FavoritesRepository extends BaseRepository<FavoriteDocument> {
  constructor(
    @InjectModel(Favorite.name) private favoritesModel: Model<FavoriteDocument>
  ) {
    super(favoritesModel);
  }
}
