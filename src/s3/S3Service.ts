import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";


const region = "us-west-2";

export default class S3Service {
  private s3Client: S3Client;

//   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: 'us-east-1:1699ebc0-7900-4099-b910-2df94f52a030',
//     Logins: { // optional tokens, used for authenticated login
//       'graph.facebook.com': 'FBTOKEN',
//       'www.amazon.com': 'AMAZONTOKEN',
//       'accounts.google.com': 'GOOGLETOKEN'
//     }
//   });

  constructor() {
    const s3Client = new S3Client({
        region,
        credentials: fromCognitoIdentityPool({
          clientConfig: { region: REGION }, // Configure the underlying CognitoIdentityClient.
          identityPoolId: 'IDENTITY_POOL_ID',
          logins: {
                  // Optional tokens, used for authenticated login.
              },
        })
      });
    this.s3Client = s3Client;      
  }

  async uploadFile(bucketName: string, key: string, body: string | Buffer) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
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
      Key: key,
    });

    try {
      const data = await this.s3Client.send(command);
      if (data.Body) {
        const blob = new Blob([data.Body], {
          type: "application/octet-stream",
        });
        const text = await blob.text();
        console.log("File content:", text);
        return text;
      } else {
        console.log("Data body is not available");
        return null;
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      return null;
    }
  }
}
