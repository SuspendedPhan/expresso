import { create } from "mutative";
import { expect, test } from "vitest";
import { makeAppState } from "./AppState";
import { DexReducer } from "./DexReducer";

test("DexObject", () => {
  const appState = makeAppState({});
  const appState2 = create(appState, DexReducer.AppState.addProject(), { mark: () => "immutable" });
  
  expect(appState2.projects[0]!.name).toBe("Untitled Project");

  const appState3 = create(appState2, DexReducer.DexProject.setName("My Project"), {
    mark: () => "immutable",
  });
  expect(appState2.projects[0]!.name).toBe("Untitled Project");
  expect(appState3.projects[0]!.name).toBe("My Project");

  const appState4 = create(appState3, DexReducer.DexProject.addComponent(), { mark: () => "immutable" });
  expect(appState4.projects[0]!.components.length).toBe(1);

  const appState5 = create(appState4, DexReducer.DexProject.addFunction(), { mark: () => "immutable" });
  expect(appState5.projects[0]!.functions.length).toBe(1);

  const appState6 = create(appState5, DexReducer.DexProject.addObject(), { mark: () => "immutable" });
  expect(appState6.projects[0]!.objects.length).toBe(1);

  const component6 = appState6.projects[0]!.components[0]!;
  const appState7 = create(appState6, DexReducer.DexCustomComponent.setName(component6, "My Component"), {
    mark: () => "immutable",
  });
  expect(appState7.projects[0]!.components[0]!.name).toBe("My Component");
});
