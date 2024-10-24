import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { projectActions, ProjectSlice } from "./DexCoreSlice"
import { SveExpr } from "./SveExpr"

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
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </div>
  )
}

