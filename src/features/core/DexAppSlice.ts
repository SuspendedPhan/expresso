import { Optional, type Option } from "typescript-optional"
import { createAppSlice } from "../../app/createAppSlice"
import type { DexFocus, DexFocusTarget } from "../../DexFocus"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface DexAppSliceState {
  focus: Option<DexFocus>
}

const initialState: DexAppSliceState = {
  focus: Optional.empty<DexFocus>().toOption(),
}

export const DexAppSlice = createAppSlice({
  name: "app",
  initialState,
  reducers: create => ({
    focusTarget: create.reducer((state, action: PayloadAction<{ focusTarget: DexFocusTarget }>) => {
      const focus: DexFocus = {
        _tag: "DexFocus",
        target: action.payload.focusTarget,
        isEditing: false,
      }
      state.focus = Optional.of(focus).toOption()
    }),
  }),
  selectors: {
    selectIsFocused(state, focusTarget: DexFocusTarget) {
      return Optional.from(state.focus)
        .filter(focus => {
          return focus.target.kind === focusTarget.kind && focus.target.targetId === focusTarget.targetId
        })
        .isPresent()
    },
  },
})

export const dexAppActions = DexAppSlice.actions
export const dexAppSelectors = DexAppSlice.selectors
