import { DehydratedLoggerConfig } from "../utils/LoggerConfigHydrator";
import GCloudPersistence from "./GCloudPersistence";

const service: PersistService = new GCloudPersistence();
const debugOverlayFilename = "debug-overlay.json";

export interface PersistService {
  readFile(name: string): Promise<string | null>;
  writeFile(name: string, content: any): Promise<void>;
}

export default class Persistence {
  public static async readLoggerConfig(): Promise<DehydratedLoggerConfig | null> {
    return this.readObject(debugOverlayFilename);
  }

  public static async writeLoggerConfig(
    cfg: DehydratedLoggerConfig
  ): Promise<void> {
    return this.writeObject(debugOverlayFilename, cfg);
  }

  private static async readObject(filename: string): Promise<any> {
    const file = await service.readFile(filename);
    if (file === null) return null;

    const obj = JSON.parse(file);
    return obj;
  }

  private static async writeObject(filename: string, content: any): Promise<void> {
    const json = JSON.stringify(content);
    return service.writeFile(filename, json);
  }
}
