import { useAppDispatch, useAppSelector } from "../../app/hooks"
import type { DexExpr } from "../../DexDomain"
import { Combobox } from "../Combobox"
import { projectActions, projectSlice } from "./dexCoreSlice"

export const Project = () => {
  const dispatch = useAppDispatch()

  const exprs = useAppSelector(projectSlice.selectors.selectExprs)

  const exprItems = exprs.map((expr, index) => (
    <div key={index}>
      <SveExpr expr={expr} />
    </div>
  ))

  return (
    <div>
      <Combobox options={[]} />
      {exprItems}
      <button onClick={() => dispatch(projectActions.addExpr({}))}>Add Expr</button>
    </div>
  )
}

export function SveExpr({ expr }: { expr: DexExpr }) {
  const options = useAppSelector(state => projectSlice.selectors.selectExprOptions(state, expr))
  return (
    <div>
      {expr.id}
      <Combobox options={options} />
    </div>
  )
}
