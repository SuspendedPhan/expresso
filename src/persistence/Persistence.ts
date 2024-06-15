import GistPersistence from "./GistPersistence";

export default class Persistence {
  public static async readDebugOverlay(): Promise<any> {
    return GistPersistence.readDebugOverlay();
  }

  public static async writeDebugOverlay(content: any): Promise<any> {
    return GistPersistence.writeDebugOverlay(content);
  }
}
