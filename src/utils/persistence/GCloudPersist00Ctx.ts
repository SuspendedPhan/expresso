import {
  getBlob,
  getStorage,
  listAll,
  ref,
  uploadString,
} from "firebase/storage";
import { log5 } from "src/utils/utils/Log5";
import Firebase from "./Firebase";
import { Effect, Layer } from "effect";

const log55 = log5("GCloudPersistenceCtx.ts");

Firebase.init();
const storage = getStorage();

export class PersistCtx extends Effect.Tag("GCloudPersistenceCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  function readFile(path: string): Effect.Effect<string, void, never> {
    return Effect.gen(function* () {
      log55.debug("readFile.start", path);
      const storageRef = ref(storage, path);
      const blob = yield* Effect.tryPromise(() => getBlob(storageRef));
      const text = yield* Effect.tryPromise(() => blob.text());
      return text;
    });
  }

  function writeFile(path: string, content: string): Effect.Effect<void, void, never> {
    return Effect.gen(function* () {
      log55.debug("writeFile.start", path);
      const storageRef = ref(storage, path);

      // Raw string is the default if no format is provided
      yield* Effect.tryPromise(() => uploadString(storageRef, content));
      log55.debug("writeFile.end");
    });
  }

  function listFiles(path: string): Effect.Effect<string[], void, never> {
    return Effect.gen(function* () {
      log55.debug("listFiles.start", path);
      
      const storageRef = ref(storage, path);
      const result = yield* Effect.tryPromise(() => listAll(storageRef));
      log55.debug("listFiles.end", result);
      
      // We can access result.prefixes if needed
      return result.items.map((itemRef) => itemRef.name);
    });
  }

  return {
    readFile,
    writeFile,
    listFiles,
  };
});

export const GCloudPersistCtx00Live = Layer.effect(PersistCtx, ctxEffect);