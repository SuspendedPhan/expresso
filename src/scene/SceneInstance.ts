import type GoModule from "src/utils/utils/GoModule";

export type SceneInstancePath = readonly ObjectSceneInstance[];

export interface ObjectSceneInstance {
  readonly exObjectId: string;
  readonly cloneId: string;
}

export interface PropertySceneInstance {
  readonly path: readonly ObjectSceneInstance[];
  readonly attributeId: string;
}

export function sceneInstancePathToString(path: SceneInstancePath): string {
  let sceneInstancePath = "";
  for (const csi of path) {
    sceneInstancePath += `${csi.exObjectId}:${csi.cloneId}`;
  }
  return sceneInstancePath;
}

export function attributeSceneInstancePathToString(goModule: GoModule, propertyId: string, path: SceneInstancePath): string {
  const sceneInstancePath = sceneInstancePathToString(path);
  const result = goModule.Evaluator.createAttributeSceneInstancePath(propertyId, sceneInstancePath);
  return result;
}
