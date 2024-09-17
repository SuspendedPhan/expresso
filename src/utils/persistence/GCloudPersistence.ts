import {
  getBlob,
  getStorage,
  listAll,
  ref,
  uploadString,
} from "firebase/storage";
import { log5 } from "src/utils/utils/Log5";
import Firebase from "./Firebase";
import type { PersistService } from "./Persistence";
import { Effect } from "effect";

const log55 = log5("GCloudPersistence.ts");

Firebase.init();
const storage = getStorage();

export default class GCloudPersistence implements PersistService {
  async readFile(path: string): Promise<string | null> {
    log55.debug("readFile.start", path);
    const storageRef = ref(storage, path);
    let blob;
    try {
      blob = await getBlob(storageRef);
    } catch (e: any) {
      if (e.code === "storage/object-not-found") {
        return null;
      }
      throw e;
    }

    const text = await blob.text();
    return text;
  }

  async writeFile(path: string, content: string): Promise<void> {
    log55.debug("writeFile.start", path);
    const storageRef = ref(storage, path);

    // Raw string is the default if no format is provided
    await uploadString(storageRef, content);
    log55.debug("writeFile.end");
  }

  listFiles(path: string): Effect.Effect<string[], Error, never> {
    return Effect.gen(function* () {
      log55.debug("listFiles.start", path);
      
      const storageRef = ref(storage, path);
      const result = yield* Effect.promise(() => listAll(storageRef));
      log55.debug("listFiles.end", result);
      
      // We can access result.prefixes if needed
      return result.items.map((itemRef) => itemRef.name);
    });
  }
}
