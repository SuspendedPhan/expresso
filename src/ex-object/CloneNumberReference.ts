import type { ExObject } from "src/ex-object/ExObject";
import { fields, variation } from "variant";

export const CloneNumberReferenceFactory = variation("CloneNumberReference", fields<{
    exObject: ExObject;
}>());
export type CloneNumberReference = ReturnType<typeof CloneNumberReferenceFactory>;