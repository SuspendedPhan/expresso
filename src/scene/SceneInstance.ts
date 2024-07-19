import type { SceneAttribute } from "src/ex-object/SceneAttribute";
import type GoModule from "src/utils/GoModule";

export type SceneInstancePath = readonly ComponentSceneInstance[];

export interface ComponentSceneInstance {
  readonly componentId: string;
  readonly cloneId: string;
}

export interface AttributeSceneInstance {
  readonly path: readonly ComponentSceneInstance[];
  readonly attributeId: string;
}

export function sceneInstancePathToString(path: SceneInstancePath): string {
  let sceneInstancePath = "";
  for (const csi of path) {
    sceneInstancePath += `${csi.componentId}:${csi.cloneId}`;
  }
  return sceneInstancePath;
}

export function attributeSceneInstancePathToString(goModule: GoModule, attr: SceneAttribute, path: SceneInstancePath): string {
  const sceneInstancePath = sceneInstancePathToString(path);
  const result = goModule.Evaluator.createAttributeSceneInstancePath(attr.id, sceneInstancePath);
  return result;
}
