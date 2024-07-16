import { Graphics } from "pixi.js";
import { ExObjectType } from "./ExObject";

type PixiSetter = (pixiObject: Graphics, value: number) => void;

export interface SceneAttributeMetadata {
    readonly id: string;
    readonly name: string;
    readonly pixiSetter: PixiSetter;
}

export const AttributeMetadataStore = {
    x: {
        name: "x",
        id: "protoX",
        pixiSetter: (pixiObject, value) => {
            pixiObject.x = value;
        },
    } as SceneAttributeMetadata,
};
