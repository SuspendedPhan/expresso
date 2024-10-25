
export enum FocusKind {
  "Object_Name",
  "Object_Component",
  "Property_Name",
  "Expr",
  "Command_New",
}

export interface DexFocus {
  readonly _tag: "DexFocus"
  readonly target: DexFocusTarget
  readonly isEditing: boolean
}

export interface DexFocusTarget {
  readonly _tag: "DexFocusTarget"
  readonly kind: FocusKind
  readonly targetId: string
}


const DexFocusTarget = makeTagFactory<DexFocusTarget>("DexFocusTarget");