// sum.test.js
import { produce } from "immer";
import { expect, test } from "vitest";
import { makeDexProject } from "./DexDomain";
import { DexReducer } from "./DexReducer";

test("DexObject", () => {
  const project = makeDexProject({});
  expect(project.name).toBe("Untitled Project");
  
  const project2 = produce(project, DexReducer.DexProject.setName("My Project"));
  expect(project.name).toBe("Untitled Project");
  expect(project2.name).toBe("My Project");
  
  const project3 = produce(project2, DexReducer.DexProject.addComponent());
  expect(project3.components.length).toBe(1);

  const project4 = produce(project3, DexReducer.DexProject.addFunction());
  expect(project4.functions.length).toBe(1);

  const project5 = produce(project4, DexReducer.DexProject.addObject());
  expect(project5.objects.length).toBe(1);
  
  const component6 = project5.components[0]!;
  const project6 = produce(project5, DexReducer.DexCustomComponent.setName(component6, "My Component"));
  expect(project6.components[0]!.name).toBe("My Component");
  
});
