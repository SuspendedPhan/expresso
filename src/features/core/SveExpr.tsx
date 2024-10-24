import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { type DexExpr, makeDexNumberExpr } from "../../DexDomain";
import { Combobox } from "../Combobox";
import { projectSelectors, projectActions } from "./DexCoreSlice";

export function SveExpr({ expr }: { expr: DexExpr }) {
    const dispatch = useAppDispatch()
    const [query, setQuery] = useState("")
  
    const options = new Array<{ label: string; expr: DexExpr }>()
    const numberValue = Number.parseFloat(query)
    if (Number.isFinite(numberValue)) {
      options.push({ label: query, expr: makeDexNumberExpr({ value: numberValue }) })
    }
  
    const text = useAppSelector(state => projectSelectors.selectExprText(state, expr))
    console.log(text)
  
    function onSubmit(index: number) {
      const option = options[index]
      dispatch(projectActions.replaceExpr({ oldExpr: expr, newExpr: option.expr }))
    }
  
    return (
      <div>
        <div>{expr.id}</div>
        <div>{text}</div>
        <Combobox options={options} onQueryChanged={v => setQuery(v)} onSubmit={onSubmit} />
      </div>
    )
  }
  