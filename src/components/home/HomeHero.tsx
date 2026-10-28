import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import Icon from '../layout/Icon'

const heroVideo =
  'https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4'
const heroPoster = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=75'
const headlineLines = ['Welcome to', 'Team Red']

function HomeHero() {
  const reducedMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loadVideo, setLoadVideo] = useState(false)
  const [videoAllowed, setVideoAllowed] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 760px) and (prefers-reduced-motion: no-preference)')
    const updatePermission = () => {
      const allowed = mediaQuery.matches && !reducedMotion
      setVideoAllowed(allowed)
      if (!allowed) setLoadVideo(false)
    }
    updatePermission()
    mediaQuery.addEventListener('change', updatePermission)
    return () => mediaQuery.removeEventListener('change', updatePermission)
  }, [reducedMotion])

  useEffect(() => {
    if (!videoAllowed || !videoRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setLoadVideo(true)
        observer.disconnect()
      }
    }, { rootMargin: '160px' })
    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [videoAllowed])

  return (
    <section aria-labelledby="home-hero-heading" className="home-hero">
      <div aria-hidden="true" className="home-hero__media">
        <video
          autoPlay={videoAllowed && loadVideo}
          className="home-hero__video"
          data-home-parallax
          loop
          muted
          playsInline
          poster={heroPoster}
          preload="none"
          ref={videoRef}
        >
          {loadVideo && <source src={heroVideo} type="video/mp4" />}
        </video>
        <img alt="" className="home-hero__poster" decoding="async" fetchPriority="high" loading="eager" src={heroPoster} />
      </div>
      <div aria-hidden="true" className="home-hero__grid" />
      <div className="home-hero__content container">
        <p className="home-hero__eyebrow" data-hero-fade>
          <span /> PERFORMANCE, BUILT AROUND YOU
        </p>
        <h1 aria-label="Welcome to Team Red" className="home-hero__title" id="home-hero-heading">
          {headlineLines.map((line) => (
            <span className="home-hero__line" key={line}>
              {line.split(' ').map((word) => (
                <span aria-hidden="true" className="home-hero__word" key={word}>
                  {[...word].map((letter, index) => (
                    <span className="home-hero__char" data-hero-char key={`${letter}-${index}`}>
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="home-hero__description" data-hero-fade>
          No off-the-shelf thinking. Just powerful PCs, handpicked parts, and the freedom to build
          your way.
        </p>
        <div className="home-hero__actions" data-hero-fade>
          <Link className="ui-button ui-button--primary home-hero__primary" to="/prebuilts/scarlet-fury">
            Shop Scarlet Fury <Icon name="arrow" />
          </Link>
          <Link className="ui-button ui-button--outline home-hero__secondary" to="/customize">
            Customize Your Own
          </Link>
        </div>
      </div>
      <a aria-label="Scroll to explore PCForge" className="home-hero__scroll" data-hero-fade href="#home-categories">
        <span>SCROLL TO EXPLORE</span>
        <span aria-hidden="true" className="home-hero__scroll-line" />
      </a>
      <div aria-hidden="true" className="home-hero__index">01 <span>/ 04</span></div>
    </section>
  )
}

export default HomeHero
