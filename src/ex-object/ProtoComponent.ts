import { type ProtoSceneProperty, ProtoSceneComponentInputStore } from "src/ex-object/SceneAttribute";

export interface ProtoComponent {
  id: string;
  name: string;
  protoAttributes: readonly ProtoSceneProperty[];
}

export const ProtoComponentStore = {
  circle: {
    id: "circle",
    name: "Circle",
    protoAttributes: [
      ProtoSceneComponentInputStore.x,
    ],
  } as ProtoComponent,
};

export function getProtoComponentById(id: string): ProtoComponent {
  return (ProtoComponentStore as any)[id];
}