import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type DexExpr, type DexObject, makeDexNumberExpr } from "../../DexDomain"

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
      state.exprs.push(makeDexNumberExpr({ id: state.exprs.length.toString() }))
    }),
    replaceExpr: create.reducer((state, action: PayloadAction<{oldExpr: DexExpr, newExpr: DexExpr}>) => {
      const index = state.exprs.findIndex((e) => e.id === action.payload.oldExpr.id);
      state.exprs.splice(index, 1, action.payload.newExpr);
    }),
  }),
  selectors: {
    selectExprs: state => state.exprs,
    selectExprOptions: (state, expr, query) => [
      "Option 1",
      "Option 2",
    ],
  },
})

export const projectActions = projectSlice.actions
export const projectSelectors = projectSlice.selectors

