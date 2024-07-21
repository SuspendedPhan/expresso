import { from } from "rxjs";
import { DehydratedLoggerConfig } from "src/utils/utils/LoggerConfigHydrator";
import { DehydratedProject } from "../hydration/Dehydrator";
import { OBS } from "../utils/Utils";
import GCloudPersistence from "./GCloudPersistence";

const service: PersistService = new GCloudPersistence();
const debugOverlayFilename = "debug-overlay.json";
const projectFilename = "project.json";

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

  public static readProject$: OBS<DehydratedProject | null> = from(
    this.readObject(projectFilename)
  );

  // public static readProject$ = new Observable<DehydratedProject | null>(
  //   (subscriber) => {
  //     const project: DehydratedProject | null =
  //       this.readObject(projectFilename)
  //     subscriber.next(project);
  //     subscriber.complete();
  //   }
  // );

  public static writeProject(project: DehydratedProject): void {
    this.writeObject(projectFilename, project);
  }

  private static async readObject(filename: string): Promise<any> {
    const file = await service.readFile(filename);
    if (file === null) return null;

    const obj = JSON.parse(file);
    return obj;
  }

  private static async writeObject(
    filename: string,
    content: any
  ): Promise<void> {
    const json = JSON.stringify(content);
    return service.writeFile(filename, json);
  }
}
