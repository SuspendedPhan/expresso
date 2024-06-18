import S3Service from "../s3/S3Service";
import { DehydratedLoggerConfig } from "../utils/LoggerConfigHydrator";

const bucketName = "expresso-bucket";
const debugOverlayFilename = "debug-overlay.json";

export default class S3Persistence {

    public static async readLoggerConfig(): Promise<DehydratedLoggerConfig | null> {
        const content = await new S3Service().downloadFile(bucketName, debugOverlayFilename);
        if (content === null) {
            return null;
        }

        return JSON.parse(content);
    }
    
    public static async writeLoggerConfig(
        content: DehydratedLoggerConfig
    ): Promise<void> {
        return new S3Service().uploadFile(
            bucketName,
            debugOverlayFilename,
            JSON.stringify(content, null, 2)
        );
    }
}