import type { RefObject } from 'react'
import useHomeAnimations from './useHomeAnimations'

function HomeAnimationController({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  useHomeAnimations(rootRef)
  return null
}

export default HomeAnimationController
