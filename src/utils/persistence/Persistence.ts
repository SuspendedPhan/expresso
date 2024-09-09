// @ts-nocheck

import { Observable } from "rxjs";
import type { DehydratedProject } from "../hydration/Dehydrator";
import type { OBS } from "../utils/Utils";
import { FirebaseAuthentication } from "./FirebaseAuthentication";
import GCloudPersistence from "./GCloudPersistence";

const service: PersistService = new GCloudPersistence();
const projectFilename = "project.json";

export interface PersistService {
  readFile(name: string): Promise<string | null>;
  writeFile(name: string, content: any): Promise<void>;
}

export default class Persistence {
  public static readProject$: OBS<DehydratedProject | null> =
    new Observable<DehydratedProject | null>((subscriber) => {
      FirebaseAuthentication.userLoggedIn$.subscribe({
        complete: () => {
          this.readObject(projectFilename).then((project) => {
            subscriber.next(project);
            subscriber.complete();
          });
        },
      });
    });

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
