import { Graphics } from "pixi.js";

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
