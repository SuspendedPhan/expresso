// sum.test.js
import { expect, test } from "vitest";
import { DexId } from "./DexId";
import { DexObject } from "./Domain";
import { DexReducer } from "./DexReducer";

test("DexObject", () => {
    const a = DexObject({ id: DexId.make(), name: "a", children: [] });
    DexReducer.DexObject.addBlankChild(a)({});
    expect(a.children.length).toBe(1);
});
