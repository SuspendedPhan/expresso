import { type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type DexExpr, type DexFunction, type DexObject, makeDexNumberExpr } from "../../DexDomain"
import { match } from "ts-pattern"

export interface ProjectSliceState {
  exprs: DexExpr[]
  objects: DexObject[]
  functions: DexFunction[]
}

const initialState: ProjectSliceState = {
  exprs: [],
  objects: [],
  functions: [],
}

export const ProjectSlice = createAppSlice({
  name: "project",
  initialState,
  reducers: create => ({
    addExpr: create.reducer(state => {
      state.exprs.push(makeDexNumberExpr({ }))
    }),
    replaceExpr: create.reducer((state, action: PayloadAction<{ oldExpr: DexExpr; newExpr: DexExpr }>) => {
      const index = state.exprs.findIndex(e => e.id === action.payload.oldExpr.id)
      state.exprs.splice(index, 1, action.payload.newExpr)
    }),
  }),
  selectors: {
    selectExprs: state => state.exprs,
    selectFunction: (state, functionId: string) => {
      const func = state.functions.find(o => o.id === functionId)
      if (func === undefined) {
        throw new Error(`Function with id ${functionId} not found`)
      }
      return func
    },
    selectExprText(state, expr: DexExpr) {
      return match(expr)
        .with({ _tag: "DexNumberExpr" }, e => e.value.toString())
        .with(
          { _tag: "DexCallExpr" },
          e => ProjectSlice.selectors.selectFunction({ project: state }, e.functionId).name,
        )
        .with({ _tag: "DexReferenceExpr" }, () => {
          throw new Error("Not implemented")
        })
        .exhaustive()

    },
  },
})

export const projectActions = ProjectSlice.actions
export const projectSelectors = ProjectSlice.selectors
