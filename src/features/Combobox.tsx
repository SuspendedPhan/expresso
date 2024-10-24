import { useState } from "react"
import { Divider } from "./Divider"
import { useFloating, offset, autoUpdate, FloatingFocusManager } from "@floating-ui/react"
import { flip } from "effect/Function"
import { shift } from "effect/MutableList"

interface ComboboxProps {
  options: { label: string }[]
  onQueryChanged: (query: string) => void
  onSubmit: (index: number) => void
}

export function Combobox({ options, onQueryChanged, onSubmit }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10)],
    whileElementsMounted: autoUpdate,
  })

  const [index, setIndex] = useState(0)

  function onInput(event: React.FormEvent<HTMLInputElement>) {
    onQueryChanged(event.currentTarget.value)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowUp":
        setIndex((index - 1 + options.length) % options.length)
        break
      case "ArrowDown":
        setIndex((index + 1) % options.length)
        break
      case "Enter":
        if (options.length === 0) {
          return
        }
        onSubmit(index)
    }
  }

  const optionEls = options.map((option, i) => (
    <div key={i} className={`${index === i ? "bg-neutral-content" : ""}`} onClick={() => onSubmit(i)}>
      {option.label}
    </div>
  ))

  return (
    <div ref={refs.setReference}>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            className="p-2 bg-white ring rounded-sm flex flex-col gap-2"
            style={{ inset: "unset", ...floatingStyles }}
          >
            <div>
              <input className="outline-none" type="text" onInput={onInput} onKeyDown={onKeyDown} />
            </div>
            <Divider />
            <div>{optionEls}</div>
          </div>
        </FloatingFocusManager>
      )}
    </div>
  )
}
