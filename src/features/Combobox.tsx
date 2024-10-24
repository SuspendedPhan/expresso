import { useState } from "react"

interface ComboboxProps {
  options: { label: string }[]
  onQueryChanged: (query: string) => void
  onSubmit: (index: number) => void
}

export function Combobox({ options, onQueryChanged, onSubmit }: ComboboxProps) {
  const optionItems = options.map((option, index) => <div key={index}>{option.label}</div>)

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

  return (
    <div>
      <input onInput={onInput} onKeyDown={onKeyDown} />
      {optionItems}
      Combobox
    </div>
  )
}
