

export interface NavSection {
    readonly title: string;
    readonly navItems: readonly NavItem[];
    // readonly focused$: OBS<boolean>;
}

export interface NavItem {
    readonly section: NavSection;
    readonly label: string;
    readonly window: DexWindow;
    readonly iconClasses: string;
}