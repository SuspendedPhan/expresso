import type { Component } from "src/ex-object/Component";
import type { Property } from "src/ex-object/Property";
import type { SUB } from "src/utils/utils/Utils";

export interface ExObject {
    component: Component;
    componentProperties: Property[];
    customPropertiesSub$: SUB<Property[]>;
}