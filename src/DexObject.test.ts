// sum.test.js
import { immerable, produce } from "immer";
import { expect, test } from "vitest";
import { DexId } from "./DexId";
import { DexReducer } from "./DexReducer";
import { DexObject, makeDexProject } from "./DexDomain";

test("DexObject", () => {

  // const project = makeDexProject({ dexObjects: [] });

  // interface TestX {
  //   readonly _tag: "TestX";
  //   readonly id: string;
  //   readonly testY: TestY;
  // }

  // interface TestY {
  //   readonly _tag: "TestY";
  //   readonly id: string;
  // }

  // const TestX = Data.tagged<TestX>("TestX");
  // const TestY = Data.tagged<TestY>("TestY");

  // const y = TestY({ id: "2" });
  // const x = TestX({ id: "1", testY: y });

  // (x as any)[immerable] = true;
  //   // (y as any)[immerable] = true;

  // const x2 = produce(x, (draft) => {
  //   draft.testY.id = "3";
  // });

  // expect(x2.testY.id).toBe("3");
  // expect(x.testY.id).toBe("2");
  // expect(x.id).toBe("1");
  // expect(x2.id).toBe("1");

  const a = DexObject({ id: DexId.make(), name: "a", children: [] });
  expect(a.children.length).toBe(0);
  const project = makeDexProject({ objects: [a] });
  (project as any)[immerable] = true;
  const project2 = produce(project, DexReducer.DexObject.addBlankChild(a));
  console.log(project2);

  const a2 = project2.objects[0];
  expect(a.children.length).toBe(0);
  expect(a2).not.toBeUndefined();
  expect(a2!.children.length).toBe(1);
});
