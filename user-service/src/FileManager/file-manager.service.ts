import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class FileManagerService {
  private s3: S3;
  private bucketName: string;
  constructor(private readonly configService: ConfigService) {
    const options: S3.Types.ClientConfiguration = {
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      region: this.configService.get<string>('S3_REGION'),
      s3ForcePathStyle:
        this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
    };
    this.bucketName = this.configService.get<string>('S3_BUCKET');

    // Configure AWS SDK with a custom endpoint
    this.s3 = new S3(options);
  }

  async uploadFile(fileName: string, file: Buffer, metaData: any) {
    try {
      // Security: sanitize the filename to allow only alphanumeric characters, underscores, and hyphens
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '');
      this.validateFile(file);

      const params = {
        Bucket: this.bucketName,
        Key: sanitizedFileName,
        Body: file,
        ContentType: metaData['Content-Type'],
        ACL: 'public-read', // Adjust as necessary
      };

      // Upload the file to Minio
      const uploaded = await this.s3.upload(params).promise();

      // Generate and return the presigned URL
      return uploaded.Location;
    } catch (error) {
      throw error;
    }
  }

  private validateFile(file: Buffer): boolean {
    // Size limit (X MB)
    const maxFileSize =
      this.configService.get<number>('S3_SIZE_LIMIT') * 1024 * 1024;
    if (file.length > maxFileSize) {
      return false;
    }

    return true;
  }
}
