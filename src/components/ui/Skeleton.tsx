import type { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
}

function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`ui-skeleton ${className}`.trim()}
      style={{ width, height, ...props.style }}
      aria-hidden="true"
      {...props}
    />
  )
}

export default Skeleton
