import { ProtoSceneAttribute, ProtoSceneAttributeStore } from "./SceneAttribute";

export interface ProtoComponent {
  id: string;
  name: string;
  protoAttributes: readonly ProtoSceneAttribute[];
}

export const ProtoComponentStore = {
  circle: {
    id: "protoCircle",
    name: "Circle",
    protoAttributes: [
      ProtoSceneAttributeStore.x,
    ],
  } as ProtoComponent,
};
