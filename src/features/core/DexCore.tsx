import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { makeDexNumberExpr, type DexExpr } from "../../DexDomain"
import { Combobox } from "../Combobox"
import { projectActions, projectSelectors, ProjectSlice } from "./DexCoreSlice"

export const Project = () => {
  const dispatch = useAppDispatch()

  const exprs = useAppSelector(ProjectSlice.selectors.selectExprs)

  const exprItems = exprs.map((expr, index) => (
    <div key={index}>
      <SveExpr expr={expr} />
    </div>
  ))

  return (
    <div>
      {exprItems}
      <button onClick={() => dispatch(projectActions.addExpr())}>Add Expr</button>
    </div>
  )
}

export function SveExpr({ expr }: { expr: DexExpr }) {
  const [query, setQuery] = useState("")
  
  const options = new Array<{ label: string; expr: DexExpr }>()
  if (Number.parseFloat(query)) {
    options.push({ label: "Number", expr: makeDexNumberExpr({}) })
  }

  const text = useAppSelector(state => projectSelectors.selectExprText(state, expr))

  return (
    <div>
      {expr.id}
      {text}
      <Combobox options={options} onQueryChanged={v => setQuery(v)} />
    </div>
  )
}
