import { Types } from "mongoose";
import { FavoritesRepository } from "./favorites.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async findByUser(user: Types.ObjectId) {
    return this.favoritesRepository.find({ user });
  }

  async create(product: Types.ObjectId, user: Types.ObjectId) {
    return this.favoritesRepository.create({ product, user });
  }

  async remove(product: Types.ObjectId, user: Types.ObjectId) {
    return this.favoritesRepository.deleteOne({ product, user });
  }

  async findOne(product: Types.ObjectId, user: Types.ObjectId) {
    return this.favoritesRepository.findOne({ product, user });
  }
}
