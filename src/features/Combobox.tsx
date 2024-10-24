interface ComboboxProps {
  options: string[]
}

export function Combobox({ options }: ComboboxProps) {
  const optionItems = options.map((option, index) => <div key={index}>{option}</div>)
  return (
    <div>
      <input />
      {optionItems}
      Combobox
    </div>
  )
}
