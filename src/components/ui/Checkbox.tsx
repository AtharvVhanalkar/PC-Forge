import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}

function Checkbox({ label, id, ...props }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <label className="ui-checkbox" htmlFor={checkboxId}>
      <input id={checkboxId} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
}

export default Checkbox
