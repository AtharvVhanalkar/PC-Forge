import { useId, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

function Select({ label, error, id, className = '', children, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <label className="ui-field" htmlFor={selectId}>
      <span>{label}</span>
      <select
        id={selectId}
        className={`ui-select ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className="ui-field__error">
          {error}
        </span>
      )}
    </label>
  )
}

export default Select
