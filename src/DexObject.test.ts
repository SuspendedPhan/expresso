// sum.test.js
import { create } from "mutative";
import { expect, test } from "vitest";
import { makeDexProject } from "./DexDomain";
import { DexReducer } from "./DexReducer";

test("DexObject", () => {
  const project = makeDexProject({});
  expect(project.name).toBe("Untitled Project");

  const project2 = create(project, DexReducer.DexProject.setName("My Project"), {
    mark: () => "immutable",
  });
  expect(project.name).toBe("Untitled Project");
  expect(project2.name).toBe("My Project");

  const project3 = create(project2, DexReducer.DexProject.addComponent(), { mark: () => "immutable" });
  expect(project3.components.length).toBe(1);

  const project4 = create(project3, DexReducer.DexProject.addFunction(), { mark: () => "immutable" });
  expect(project4.functions.length).toBe(1);

  const project5 = create(project4, DexReducer.DexProject.addObject(), { mark: () => "immutable" });
  expect(project5.objects.length).toBe(1);

  const component6 = project5.components[0]!;
  const project6 = create(project5, DexReducer.DexCustomComponent.setName(component6, "My Component"), {
    mark: () => "immutable",
  });
  expect(project6.components[0]!.name).toBe("My Component");
});
