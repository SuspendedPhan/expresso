import { Attribute } from "./ExObject";
import { SceneObject } from "./scene/SceneContext";

type SceneAttributeSetter = (sceneObject: SceneObject, value: number) => void;

export interface ProtoSceneAttribute {
    readonly id: string;
    readonly name: string;
    readonly sceneAttributeSetter: SceneAttributeSetter;
}

export interface SceneAttribute extends Attribute {
    readonly proto: ProtoSceneAttribute;
}

export const ProtoSceneAttributeStore = {
    x: {
        name: "x",
        id: "protoX",
        sceneAttributeSetter: (pixiObject, value) => {
            pixiObject.x = value;
        },
    } as ProtoSceneAttribute,
};
