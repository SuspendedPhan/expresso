import { DehydratedLoggerConfig } from "../utils/LoggerConfigHydrator";
import S3Persistence from "./S3Persistence";

const service: PersistService = new S3Persistence();
const debugOverlayFilename = "debug-overlay.json";

export interface PersistService {
  readFile(name: string): Promise<any>;
  writeFile(name: string, content: any): Promise<void>;
}

export default class Persistence {
  public static async readLoggerConfig(): Promise<DehydratedLoggerConfig | null> {
    return service.readFile(debugOverlayFilename);
  }

  public static async writeLoggerConfig(
    content: DehydratedLoggerConfig
  ): Promise<void> {
    return service.writeFile(debugOverlayFilename, content);
  }
}
