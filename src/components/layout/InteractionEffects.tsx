import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLocation } from 'react-router-dom'

const interactiveSelector = 'a, button, [role="button"], input, select, textarea'
const magneticSelector = '.ui-button--primary'

function InteractionEffects() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const media = gsap.matchMedia()
    media.add(
      '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        const cursor = cursorRef.current
        if (!cursor) return
        const activeCursor = cursor

        document.documentElement.classList.add('has-custom-cursor')
        gsap.set(activeCursor, { autoAlpha: 0 })
        const moveX = gsap.quickTo(activeCursor, 'x', { duration: 0.2, ease: 'power2.inOut' })
        const moveY = gsap.quickTo(activeCursor, 'y', { duration: 0.2, ease: 'power2.inOut' })
        const magneticMoves = new WeakMap<HTMLElement, { x: (value: number) => void; y: (value: number) => void }>()
        let hoveredElement: HTMLElement | null = null
        let magneticElement: HTMLElement | null = null
        let cursorVisible = false

        function setHoveredElement(next: HTMLElement | null) {
          if (next === hoveredElement) return
          hoveredElement = next
          gsap.to(activeCursor, {
            scale: next ? 1.65 : 1,
            duration: 0.2,
            ease: 'power2.inOut',
          })
          activeCursor.classList.toggle('is-interactive', Boolean(next))
        }

        function resetMagnetic() {
          if (!magneticElement) return
          const movement = magneticMoves.get(magneticElement)
          movement?.x(0)
          movement?.y(0)
          magneticElement = null
        }

        function handlePointerMove(event: PointerEvent) {
          if (!cursorVisible) {
            cursorVisible = true
            gsap.to(activeCursor, { autoAlpha: 1, duration: 0.2, ease: 'power2.inOut' })
          }
          moveX(event.clientX - 10)
          moveY(event.clientY - 10)

          const target = event.target instanceof Element ? event.target : null
          const interactive = target?.closest<HTMLElement>(interactiveSelector) ?? null
          setHoveredElement(interactive)

          const nextMagnetic = target?.closest<HTMLElement>(magneticSelector) ?? null
          if (nextMagnetic !== magneticElement) {
            resetMagnetic()
            magneticElement = nextMagnetic
            if (magneticElement) {
              const movement = {
                x: gsap.quickTo(magneticElement, 'x', { duration: 0.3, ease: 'power2.inOut' }),
                y: gsap.quickTo(magneticElement, 'y', { duration: 0.3, ease: 'power2.inOut' }),
              }
              magneticMoves.set(magneticElement, movement)
              movement.x(0)
              movement.y(-2)
            }
          }

          if (magneticElement) {
            const rect = magneticElement.getBoundingClientRect()
            const x = Math.max(-7, Math.min(7, (event.clientX - rect.left - rect.width / 2) * 0.12))
            const y = Math.max(-6, Math.min(6, (event.clientY - rect.top - rect.height / 2) * 0.12)) - 2
            const movement = magneticMoves.get(magneticElement)
            movement?.x(x)
            movement?.y(y)
          }
        }

        function handlePointerOut(event: PointerEvent) {
          if (event.relatedTarget instanceof Node && document.documentElement.contains(event.relatedTarget)) return
          cursorVisible = false
          gsap.to(activeCursor, { autoAlpha: 0, duration: 0.2, ease: 'power2.inOut' })
          setHoveredElement(null)
          resetMagnetic()
        }

        document.addEventListener('pointermove', handlePointerMove, { passive: true })
        document.addEventListener('pointerout', handlePointerOut)
        return () => {
          document.removeEventListener('pointermove', handlePointerMove)
          document.removeEventListener('pointerout', handlePointerOut)
          resetMagnetic()
          gsap.killTweensOf(activeCursor)
          document.documentElement.classList.remove('has-custom-cursor')
          activeCursor.classList.remove('is-interactive')
        }
      },
    )

    return () => media.revert()
  }, [location.pathname])

  return <div aria-hidden="true" className="custom-cursor" ref={cursorRef} />
}

export default InteractionEffects
