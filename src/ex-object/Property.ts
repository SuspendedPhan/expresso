import type { OBS, SUB } from "src/utils/utils/Utils";
import type { ExObjectBase, Expr } from "./ExObject";
import type { ExObjectMut } from "src/main-context/MainMutator";
import type { ProtoSceneProperty } from "./SceneAttribute";

export enum PropertyType {
    SceneProperty,
    ObjectProperty,
}

export interface PropertyBase extends ExObjectBase {
    expr$: OBS<Expr>;
}

export type PropertyBaseMut = PropertyBase & ExObjectMut & {
    exprSub$: SUB<Expr>;
}

export interface SceneProperty extends PropertyBase {
    propertyType: PropertyType.SceneProperty;
    proto: ProtoSceneProperty;
}

export interface ObjectProperty extends PropertyBase {
    propertyType: PropertyType.ObjectProperty;
    name$: OBS<string>;
}

export type ObjectPropertyMut = ObjectProperty & ExObjectMut & {
    nameSub$: SUB<string>;
}