import { Graphics } from "pixi.js";
import { Attribute } from "./ExObject";

type PixiSetter = (pixiObject: Graphics, value: number) => void;

export interface SceneAttributeMetadata {
    readonly id: string;
    readonly name: string;
    readonly pixiSetter: PixiSetter;
}

export interface SceneAttribute {
    readonly metadata: SceneAttributeMetadata;
    readonly attribute: Attribute;
}

export const SceneAttributeMetadataStore = {
    x: {
        name: "x",
        id: "protoX",
        pixiSetter: (pixiObject, value) => {
            pixiObject.x = value;
        },
    } as SceneAttributeMetadata,
};
