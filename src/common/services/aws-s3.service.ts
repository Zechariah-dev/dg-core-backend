import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AwsS3Service {
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.get("D_AWS_REGION"),
      accessKeyId: this.configService.get("D_AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("D_AWS_SECRET_ACCESS_KEY"),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.configService.get("D_AWS_BUCKET_NAME"),
      Key: `${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
