import type { Component } from "src/ex-object/Component";
import type { ComponentParameter } from "src/ex-object/ComponentParameter";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

interface ComponentFocus_ {
    Component: { component: Component };
    Name: { component: Component, isEditing: boolean };
    Parameter: { parameter: ComponentParameter, isEditing: boolean };
}

export const ComponentFocusFactory = dexVariant.scoped("ComponentFocus")(dexVariant.typed<ComponentFocus_>({
    Component: pass,
    Name: pass,
    Parameter: pass,
}));

export type ComponentFocus = VariantOf<typeof ComponentFocusFactory>;
export type ComponentFocusKind = DexVariantKind<typeof ComponentFocusFactory>;