import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type DexExpr, DexNumberExprId, type DexObject, makeDexNumberExpr, makeDexObject } from "../../DexDomain"

export interface ProjectSliceState {
  exprs: DexExpr[]
  objects: DexObject[]
}

const initialState: ProjectSliceState = {
  exprs: [],
  objects: [],
}

export const projectSlice = createAppSlice({
  name: "project",
  initialState,
  reducers: create => ({
    addExpr: create.reducer((state, action: PayloadAction<{}>) => {
      state.exprs.push(makeDexNumberExpr({ id: DexNumberExprId(state.exprs.length.toString()) }))
    }),

    addObject: create.reducer((state, action: PayloadAction<{}>) => {
      state.objects.push(makeDexObject({}))
    }),

    objectAddChild: create.reducer((state, action: PayloadAction<{ objectIndex: number }>) => {
      const object = state.objects[action.payload.objectIndex]
      object.children.push(makeDexObject({}))
    }),
  }),
  selectors: {
    selectExprs: state => state.exprs,
  },
})

export const projectActions = projectSlice.actions
export const projectSelectors = projectSlice.selectors
