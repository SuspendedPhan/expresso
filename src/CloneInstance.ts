export type SceneInstancePath = readonly ComponentSceneInstance[];

export interface ComponentSceneInstance {
  readonly componentId: string;
  readonly cloneId: string;
}

export interface AttributeSceneInstance {
  readonly path: readonly ComponentSceneInstance[];
  readonly attributeId: string;
}
