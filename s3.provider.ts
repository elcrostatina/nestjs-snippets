import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

@Injectable()
export class S3Provider {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const config = {
      region: this.configService.get<string>('aws.s3.region'),
    };

    if (
      this.configService.get<string>('aws.s3.accessKeyId') &&
      this.configService.get<string>('aws.s3.secretAccessKey')
    ) {
      config['credentials'] = {
        accessKeyId: this.configService.get<string>('aws.s3.accessKeyId'),
        secretAccessKey: this.configService.get<string>(
          'aws.s3.secretAccessKey',
        ),
      };
    }

    this.s3Client = new S3Client(config);
  }

  public async downloadFile(params: {
    Bucket: string;
    Key: string;
  }): Promise<Readable> {
    const command = new GetObjectCommand(params);

    const response = await this.s3Client.send(command);
    if (response.Body instanceof Readable) {
      return response.Body;
    } else {
      throw new Error('Unexpected response body type');
    }
  }
}
