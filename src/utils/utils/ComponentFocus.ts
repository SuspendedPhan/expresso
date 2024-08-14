import type { CustomComponent } from "src/ex-object/Component";
import { ofType } from "unionize";

export const ComponentFocusKind = {
    Component: ofType<{component: CustomComponent}>(),
    ComponentName: ofType<{isEditing: boolean}>(),
};

export namespace ComponentFocusFns {
    
}