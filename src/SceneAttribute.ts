import { Graphics } from "pixi.js";
import { Attribute } from "./ExObject";

type PixiSetter = (pixiObject: Graphics, value: number) => void;

export interface ProtoSceneAttribute {
    readonly id: string;
    readonly name: string;
    readonly pixiSetter: PixiSetter;
}

export interface SceneAttribute {
    readonly proto: ProtoSceneAttribute;
    readonly attribute: Attribute;
}

export const ProtoSceneAttributeStore = {
    x: {
        name: "x",
        id: "protoX",
        pixiSetter: (pixiObject, value) => {
            pixiObject.x = value;
        },
    } as ProtoSceneAttribute,
};
