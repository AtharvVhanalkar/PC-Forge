import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
