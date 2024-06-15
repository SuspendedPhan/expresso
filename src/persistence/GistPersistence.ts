import GistClient from "../gist/GistClient";

const debugOverlayGistId = "5d5fcb97a8e74e415d37c3ae590b417a";
const debugOverlayFilename = "debug-overlay.json";

export default class GistPersistence {
  public static async readDebugOverlay(): Promise<any> {
    const g = new GistClient();
    return g.getGist(debugOverlayGistId).then((gist) => {
      console.log(gist);

      const file = gist.files[debugOverlayFilename];
      const content = file.content;
      const parsedContent = JSON.parse(content);
      console.log(content);
      console.log(parsedContent);
      return parsedContent;
    });
  }

  public static async writeDebugOverlay(content: any): Promise<any> {
    const g = new GistClient();
    const stringContent = JSON.stringify(content, null, 2);
    return g.updateGist(debugOverlayGistId, {
      [debugOverlayFilename]: stringContent,
    });
  }
}
