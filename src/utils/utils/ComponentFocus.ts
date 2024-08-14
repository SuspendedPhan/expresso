import { ofType } from "unionize";

export const ComponentFocusKind = {
    ComponentName: ofType<{isEditing: boolean}>(),
};

export namespace ComponentFocusFns {
    
}