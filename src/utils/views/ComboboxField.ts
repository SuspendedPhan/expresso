import type { ComboboxOption, ComboboxPropsIn } from "src/utils/views/Combobox";
import {
    type FieldValueData
} from "src/utils/views/Field";
import type { Readable } from "svelte/store";

export interface ComboboxFieldPropsIn<T extends ComboboxOption> {
    propsIn: ComboboxPropsIn<T>;
    label: string;
    fieldValueData: FieldValueData;
    displayValue: Readable<string>;
}