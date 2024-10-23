import type { FocusViewProps } from "./FocusView";

export interface TextFieldProps {
    label?: string;
    value: string;
    onInput: (e: Event) => void;
    isEditing: boolean;
    focusViewProps: FocusViewProps;
}