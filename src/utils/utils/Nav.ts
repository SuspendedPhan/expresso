import { DexWindow } from "src/main-context/MainViewContext";
import type { OBS } from "./Utils";

export interface NavSection {
    readonly title: string;
    readonly navItems: readonly NavItem[];
    readonly focused$: OBS<boolean>;
}

export interface NavItem {
    readonly section: NavSection;
    readonly label: string;
    readonly window: DexWindow;
    readonly iconClasses: string;
}