import { Window } from "src/main-context/MainViewContext";
import { OBS } from "./Utils";

export interface Section {
    readonly title: string;
    readonly navItems: readonly NavItem[];
    readonly focused$: OBS<boolean>;
}

export interface NavItem {
    readonly section: Section;
    readonly label: string;
    readonly window: Window;
    readonly iconClasses: string;
}