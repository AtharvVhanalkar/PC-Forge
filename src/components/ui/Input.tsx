import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

function Input({ label, hint, error, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`

  return (
    <label className="ui-field" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={`ui-input ${className}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      {error ? (
        <span id={messageId} className="ui-field__error">
          {error}
        </span>
      ) : (
        hint && (
          <span id={messageId} className="ui-field__hint">
            {hint}
          </span>
        )
      )}
    </label>
  )
}

export default Input
