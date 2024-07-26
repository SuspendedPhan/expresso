import type { Attribute } from "src/ex-object/ExObject";
import type { SceneObject } from "src/scene/SceneContext";

type SceneAttributeSetter = (sceneObject: SceneObject, value: number) => void;

export interface ProtoSceneProperty {
  readonly id: string;
  readonly name: string;
  readonly sceneAttributeSetter: SceneAttributeSetter;
}

export interface SceneProperty extends Attribute {
  readonly proto: ProtoSceneProperty;
}

export const ProtoScenePropertyStore = {
  x: {
    name: "x",
    id: "x",
    sceneAttributeSetter: (pixiObject, value) => {
      pixiObject.x = value;
    },
  } as ProtoSceneProperty,
};

export function getProtoSceneAttributeById(id: string): ProtoSceneProperty {
  return (ProtoScenePropertyStore as any)[id];
}
