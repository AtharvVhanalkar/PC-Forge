import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollEffectsProps {
  paused?: boolean
}

function ScrollEffects({ paused: _paused }: ScrollEffectsProps = {}) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger && !document.contains(trigger.trigger as Node)) {
        trigger.kill(true)
      }
    })
    ScrollTrigger.refresh()
  }, [location.pathname])

  return null
}

export default ScrollEffects
