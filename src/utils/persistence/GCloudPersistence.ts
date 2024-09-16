import { getBlob, getStorage, ref, uploadString } from "firebase/storage";
import { log5 } from "src/utils/utils/Log5";
import Firebase from "./Firebase";
import type { PersistService } from "./Persistence";

const log55 = log5("GCloudPersistence.ts");

Firebase.init();
const storage = getStorage();

export default class GCloudPersistence implements PersistService {
  async readFile(path: string): Promise<string | null> {
    log55.debug("Reading file", path);
    const storageRef = ref(storage, path);
    let blob;
    try {
        blob = await getBlob(storageRef);
    } catch (e: any) {
        if (e.code === 'storage/object-not-found') {
            return null;
        }
        throw e;
    }

    const text = await blob.text();
    return text;
  }
  writeFile(path: string, content: string): Promise<void> {
    log55.debug("Writing file", path);
    const storageRef = ref(storage, path);

    // Raw string is the default if no format is provided
    return uploadString(storageRef, content).then((_snapshot) => {
      log55.debug("Uploaded a blob or file");
    });
  }
}
