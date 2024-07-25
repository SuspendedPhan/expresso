import { Window } from "src/main-context/MainViewContext";
import { OBS } from "./Utils";

export interface NavSection {
    readonly title: string;
    readonly navItems: readonly NavItem[];
    readonly focused$: OBS<boolean>;
}

export interface NavItem {
    readonly section: NavSection;
    readonly label: string;
    readonly window: Window;
    readonly iconClasses: string;
}