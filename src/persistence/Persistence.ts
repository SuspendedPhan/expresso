import { DehydratedLoggerConfig } from "../utils/LoggerConfigHydrator";
import GistPersistence from "./GistPersistence";

export default class Persistence {
  public static async readLoggerConfig(): Promise<DehydratedLoggerConfig> {
    return GistPersistence.readLoggerConfig();
  }

  public static async writeLoggerConfig(content: DehydratedLoggerConfig): Promise<void> {
    return GistPersistence.writeLoggerConfig(content);
  }
}
