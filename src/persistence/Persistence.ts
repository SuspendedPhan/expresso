import { DehydratedLoggerConfig } from "../utils/LoggerConfigHydrator";
import S3Persistence from "./S3Persistence";

export default class Persistence {
  public static async readLoggerConfig(): Promise<DehydratedLoggerConfig | null> {
    return S3Persistence.readLoggerConfig();
  }

  public static async writeLoggerConfig(
    content: DehydratedLoggerConfig
  ): Promise<void> {
    return S3Persistence.writeLoggerConfig(content);
  }
}
