import type { Attribute } from "src/ex-object/ExObject";
import type { SceneObject } from "src/scene/SceneContext";

type SceneAttributeSetter = (sceneObject: SceneObject, value: number) => void;

export interface ProtoSceneAttribute {
  readonly id: string;
  readonly name: string;
  readonly sceneAttributeSetter: SceneAttributeSetter;
}

export interface SceneProperty extends Attribute {
  readonly proto: ProtoSceneAttribute;
}

export const ProtoSceneAttributeStore = {
  x: {
    name: "x",
    id: "x",
    sceneAttributeSetter: (pixiObject, value) => {
      pixiObject.x = value;
    },
  } as ProtoSceneAttribute,
};

export function getProtoSceneAttributeById(id: string): ProtoSceneAttribute {
  return (ProtoSceneAttributeStore as any)[id];
}
