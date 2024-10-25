import { useAppDispatch, useAppSelector } from "../../app/hooks"
import type { DexFocusTarget } from "../../DexFocus"
import { dexAppSelectors, DexAppSlice } from "./DexAppSlice"

interface FocusViewProps {
  focusTarget: DexFocusTarget
}

export function FocusView({ focusTarget }: FocusViewProps) {
  const dispatch = useAppDispatch()
  function onMouseDown(_event: React.MouseEvent) {
    dispatch(DexAppSlice.actions.focusTarget({ focusTarget }))
  }

  const focused = useAppSelector(state => dexAppSelectors.selectIsFocused(state, focusTarget))

  return (
    <div onMouseDown={onMouseDown} className="ring-black" class:ring-2={focused}>
      <slot />
    </div>
  )
}
