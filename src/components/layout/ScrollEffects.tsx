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
    ScrollTrigger.refresh()
  }, [location.pathname])

  return null
}

export default ScrollEffects
