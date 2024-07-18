import { getBlob, getStorage, ref, uploadString } from "firebase/storage";
import { PersistService } from "./Persistence";
import Firebase from "./Firebase";

Firebase.init();
const storage = getStorage();

export default class GCloudPersistence implements PersistService {
  async readFile(name: string): Promise<string | null> {
    const storageRef = ref(storage, name);
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
  writeFile(name: string, content: string): Promise<void> {
    const storageRef = ref(storage, name);

    // Raw string is the default if no format is provided
    return uploadString(storageRef, content).then((_snapshot) => {
      console.log("Uploaded a raw string!");
    });
  }
}
