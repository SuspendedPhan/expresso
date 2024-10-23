import type { DexObjectId } from "./DexDomain";

export interface FocusTarget {
}

export interface SveObject {
    readonly id: DexObjectId;
    readonly name: FocusTarget;
}