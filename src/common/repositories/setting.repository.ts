import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import {
  SettingDocument,
  Setting,
} from "../schemas/setting.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class SettingsRepository extends BaseRepository<SettingDocument> {
  constructor(
    @InjectModel(Setting.name) private settingsModel: Model<SettingDocument>
  ) {
    super(settingsModel);
  }
}
