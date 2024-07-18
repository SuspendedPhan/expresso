import { SceneAttribute } from "./SceneAttribute";
import GoModule from "./utils/GoModule";

export type SceneInstancePath = readonly ComponentSceneInstance[];

export interface ComponentSceneInstance {
  readonly componentId: string;
  readonly cloneId: string;
}

export interface AttributeSceneInstance {
  readonly path: readonly ComponentSceneInstance[];
  readonly attributeId: string;
}

export function attributeSceneInstancePathToString(goModule: GoModule, attr: SceneAttribute, path: SceneInstancePath): string {
  let sceneInstancePath = "";
  for (const csi of path) {
    goModule.Evaluator.sceneInstancePathAppend(sceneInstancePath, csi.componentId, csi.cloneId);
  }
  const result = goModule.Evaluator.createAttributeSceneInstancePath(attr.id, sceneInstancePath);
  return result;
}
