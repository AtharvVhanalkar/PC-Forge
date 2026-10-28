import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger)

function ScrollEffects({ paused }: { paused: boolean }) {
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const responsiveEffects = gsap.matchMedia()
    responsiveEffects.add(
      '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
      () => {
          const lenis = new Lenis({ autoRaf: false, smoothWheel: true })
          lenisRef.current = lenis
          const updateScrollTrigger = () => ScrollTrigger.update()
          const tick = (time: number) => lenis.raf(time * 1000)

          lenis.on('scroll', updateScrollTrigger)
          gsap.ticker.add(tick)

          return () => {
            lenis.off('scroll', updateScrollTrigger)
            gsap.ticker.remove(tick)
            lenis.destroy()
            lenisRef.current = null
          }
      },
    )

    return () => responsiveEffects.revert()
  }, [reducedMotion])

  useEffect(() => {
    if (paused) {
      lenisRef.current?.stop()
    } else {
      lenisRef.current?.start()
    }
  }, [paused, reducedMotion])

  useEffect(() => {
    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    }
    ScrollTrigger.refresh()
  }, [location.pathname, reducedMotion])

  return null
}

export default ScrollEffects
