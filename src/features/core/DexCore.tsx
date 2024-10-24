
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { projectActions, projectSlice } from "./dexCoreSlice";

export const Project = () => {
  const dispatch = useAppDispatch()
  
  const exprs = useAppSelector(projectSlice.selectors.selectExprs);

  const exprItems = exprs.map((expr, index) => (
    <div key={index}>
      {expr.id}
    </div>
  ))

  return (
    <div>
      {exprItems}
      <button onClick={() => dispatch(projectActions.addExpr({}))}>Add Expr</button>
    </div>
  )
}
