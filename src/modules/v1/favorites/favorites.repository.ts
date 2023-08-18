import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { Favorite, FavoriteDocument } from "./schemas/favorite.schema";

export class FavoritesRepository extends BaseRepository<FavoriteDocument> {
  constructor(
    @InjectModel(Favorite.name) private favoritesModel: Model<FavoriteDocument>
  ) {
    super(favoritesModel);
  }

  public async find(
    query: FilterQuery<FavoriteDocument>,
    projections?: unknown | null,
    options?: QueryOptions<unknown>
  ) {
    return this.favoritesModel.find(query, projections, options).populate([
      {
        path: "user",
        select: "image fullname email phone _id",
      },
      {
        path: "product",
        select: "title images _id price description",
      },
    ]);
  }

  public findOne(query: FilterQuery<FavoriteDocument>, projections?: unknown) {
    return this.favoritesModel.findOne(query, projections).populate([
      {
        path: "user",
        select: "image fullname email phone _id",
      },
      {
        path: "product",
        select: "title images _id price description",
      },
    ]);
  }
}
