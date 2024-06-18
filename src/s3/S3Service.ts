import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';

class S3Service {
  private s3Client: S3Client;

  constructor(region: string) {
    this.s3Client = new S3Client({ region });
  }

  async uploadFile(bucketName: string, key: string, body: string | Buffer) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body
    });

    try {
      const data = await this.s3Client.send(command);
      console.log("Successfully uploaded file:", data);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  }

  async downloadFile(bucketName: string, key: string): Promise<string | null> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    try {
      const data = await this.s3Client.send(command);

      if (data.Body instanceof Readable) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of data.Body) {
          chunks.push(chunk);
        }
        const fileContent = Buffer.concat(chunks).toString('utf-8');
        console.log("File content:", fileContent);
        return fileContent;
      } else {
        console.log("Data is not a readable stream");
        return null;
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      return null;
    }
  }
}

// Usage example
const region = "us-west-2";
const bucketName = "your-bucket-name";
const key = "example.txt";
const fileContent = "Hello, S3!";

const s3Service = new S3Service(region);

// Upload a file
s3Service.uploadFile(bucketName, key, fileContent).then(() => {
  // Download the file
  s3Service.downloadFile(bucketName, key);
});
