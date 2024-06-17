import LoggerConfig from "../utils/LoggerConfig";
import GistPersistence from "./GistPersistence";

export default class Persistence {
  public static async readLoggerConfig(): Promise<LoggerConfig> {
    return GistPersistence.readLoggerConfig();
  }

  public static async writeLoggerConfig(content: any): Promise<LoggerConfig> {
    return GistPersistence.writeLoggerConfig(content);
  }
}
