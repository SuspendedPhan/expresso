// @ts-nocheck

import { fields } from "variant";

class Bar {
    static Var1 = fields<{ bar1: Bar }>();
    static Var2 = fields<{ bar2: Bar }>();
}

class Var1 extends Bar {
    
}

type BarKind = {
    [Property in keyof typeof Bar as Exclude<Property, "prototype">]: typeof Bar[Property]
};

type BarKind2 = {
    [Property in keyof BarKind]: ReturnType<BarKind[Property]>
};

type BarKind3 = BarKind2[keyof BarKind2];

const a = Bar.Var1({ bar1: new Bar() });
