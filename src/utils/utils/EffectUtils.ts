import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import type { OBS } from "src/utils/utils/Utils";

export const EffectUtils = {
    firstValueFrom<T>(source: OBS<T>): Effect.Effect<T> {
        return Effect.promise(() => firstValueFrom(source));
    }
};