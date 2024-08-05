import { firstValueFrom } from "rxjs";
import type { Project } from "src/ex-object/ExItem";

export namespace ProjectUtils {
    export async function getAndIncrementOrdinal(project: Project): Promise<number> {
        const ordinal = await firstValueFrom(project.currentOrdinal$);
        project.currentOrdinal$.next(ordinal + 1);
        return ordinal;
    }
}