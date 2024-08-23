import type { CustomComponent } from "src/ex-object/Component";
import { ofType } from "unionize";

export const ComponentFocusKind = {
    Component: ofType<{component: CustomComponent}>(),
    ComponentName: ofType<{component: CustomComponent, isEditing: boolean}>(),
};

export namespace ComponentFocusFns {
    
}