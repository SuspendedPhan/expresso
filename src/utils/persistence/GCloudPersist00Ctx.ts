import { Effect, Either, Layer, Option } from "effect";
import {
  getBlob,
  getStorage,
  listAll,
  ref,
  uploadString,
} from "firebase/storage";
import { log5 } from "src/utils/utils/Log5";
import Firebase from "./Firebase";

const log55 = log5("GCloudPersistenceCtx.ts");

Firebase.init();
const storage = getStorage();

export class PersistCtx extends Effect.Tag("GCloudPersistenceCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  function readFile(
    path: string
  ): Effect.Effect<Option.Option<string>, never, never> {
    return Effect.gen(function* () {
      log55.debug("Reading file", path);
      const storageRef = ref(storage, path);
      const blob = yield* Effect.either(
        Effect.tryPromise(() => getBlob(storageRef))
      );
      if (Either.isLeft(blob)) {
        log55.debug("File not found", path);
        return Option.none();
      }

      const text = yield* Effect.promise(() => blob.right.text());
      return Option.some(text);
    });
  }

  function writeFile(
    path: string,
    content: string
  ): Effect.Effect<void, void, never> {
    return Effect.gen(function* () {
      log55.debug("Writing file", path);
      const storageRef = ref(storage, path);

      // Raw string is the default if no format is provided
      yield* Effect.catchAll(
        Effect.tryPromise(() => uploadString(storageRef, content)),
        (error) => {
          log55.error("Error writing file");
          return Effect.fail(error);
        }
      );

      log55.debug("writeFile.end");
    });
  }

  function listFiles(path: string): Effect.Effect<string[], void, never> {
    return Effect.gen(function* () {
      log55.debug("Listing files", path);

      const storageRef = ref(storage, path);
      const result = yield* Effect.tryPromise(() => listAll(storageRef));
      log55.debug("List files result", result);

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
