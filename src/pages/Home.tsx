import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import BuildHelpBanner from '../components/home/BuildHelpBanner'
import BuildShowcase from '../components/home/BuildShowcase'
import CategoryTiles from '../components/home/CategoryTiles'
import EbookPromo from '../components/home/EbookPromo'
import FeaturedParts from '../components/home/FeaturedParts'
import HomeHero from '../components/home/HomeHero'
import Reviews from '../components/home/Reviews'
import SellPartsStrip from '../components/home/SellPartsStrip'
import Stats from '../components/home/Stats'
import StatementBanner from '../components/home/StatementBanner'
import WhyPrebuilts from '../components/home/WhyPrebuilts'

const HomeAnimationController = lazy(() => import('./HomeAnimationController'))

type HomeMotionMode = 'desktop' | 'mobile' | 'none'

function Home() {
  const homeRef = useRef<HTMLDivElement>(null)
  const [motionMode, setMotionMode] = useState(getHomeMotionMode)

  useEffect(() => {
    const desktopMotion = window.matchMedia(
      '(min-width: 760px) and (prefers-reduced-motion: no-preference)',
    )
    const mobileMotion = window.matchMedia(
      '(max-width: 759px) and (prefers-reduced-motion: no-preference)',
    )

    function updateMotionMode() {
      setMotionMode(desktopMotion.matches ? 'desktop' : mobileMotion.matches ? 'mobile' : 'none')
    }

    updateMotionMode()
    desktopMotion.addEventListener('change', updateMotionMode)
    mobileMotion.addEventListener('change', updateMotionMode)
    return () => {
      desktopMotion.removeEventListener('change', updateMotionMode)
      mobileMotion.removeEventListener('change', updateMotionMode)
    }
  }, [])

  useEffect(() => {
    const root = homeRef.current
    if (!root || motionMode !== 'mobile') return

    const targets = root.querySelectorAll<HTMLElement>('.home-reveal, .home-reveal-child')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.remove('home-motion-pending')
        entry.target.classList.add('home-motion-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -10% 0px' })

    targets.forEach((target) => {
      target.classList.add('home-motion-pending')
      observer.observe(target)
    })

    return () => {
      observer.disconnect()
      targets.forEach((target) => {
        target.classList.remove('home-motion-pending', 'home-motion-visible')
      })
    }
  }, [motionMode])

  return (
    <div className="home-page" ref={homeRef}>
      {motionMode === 'desktop' && (
        <Suspense fallback={null}>
          <HomeAnimationController rootRef={homeRef} />
        </Suspense>
      )}
      <HomeHero />
      <CategoryTiles />
      <StatementBanner />
      <WhyPrebuilts />
      <BuildShowcase />
      <FeaturedParts />
      <SellPartsStrip />
      <BuildHelpBanner />
      <Stats />
      <Reviews />
      <EbookPromo />
    </div>
  )
}

function getHomeMotionMode(): HomeMotionMode {
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return 'none'
  return window.matchMedia('(min-width: 760px)').matches ? 'desktop' : 'mobile'
}

export default Home
