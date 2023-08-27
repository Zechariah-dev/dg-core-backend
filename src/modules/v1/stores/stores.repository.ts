import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { StoreDocument, Store } from "./schemas/store.schema";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class StoresRepository extends BaseRepository<StoreDocument> {
  constructor(
    @InjectModel(Store.name) private storesModel: Model<StoreDocument>
  ) {
    super(storesModel);
  }
}
