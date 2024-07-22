import { type ProtoSceneAttribute, ProtoSceneAttributeStore } from "src/ex-object/SceneAttribute";

export interface ProtoComponent {
  id: string;
  name: string;
  protoAttributes: readonly ProtoSceneAttribute[];
}

export const ProtoComponentStore = {
  circle: {
    id: "circle",
    name: "Circle",
    protoAttributes: [
      ProtoSceneAttributeStore.x,
    ],
  } as ProtoComponent,
};

export function getProtoComponentById(id: string): ProtoComponent {
  return (ProtoComponentStore as any)[id];
}