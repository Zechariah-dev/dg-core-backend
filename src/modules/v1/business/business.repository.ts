import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Business, BusinessDocument } from "./schemas/business.schema";

@Injectable()
export class BusinessRepository extends BaseRepository<BusinessDocument> {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>
  ) {
    super(businessModel);
  }
}
