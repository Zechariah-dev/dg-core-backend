import { Types } from "mongoose";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends CreateProductDto {}

export class UpdateProductPayload extends UpdateProductDto {
  seller: Types.ObjectId;
}
