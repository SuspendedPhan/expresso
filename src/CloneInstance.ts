export type AttributeCloneInstancePath = readonly ComponentCloneInstance[];

export interface ComponentCloneInstance {
  readonly componentId: string;
  readonly cloneId: string;
}

export interface AttributeCloneInstance {
  readonly path: readonly ComponentCloneInstance[];
  readonly attributeId: string;
}
