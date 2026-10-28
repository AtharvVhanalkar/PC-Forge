import { useEffect, type RefObject } from 'react'
import { animate as animeAnimate, stagger as animeStagger, svg as animeSvg } from 'animejs'
import type { JSAnimation } from 'animejs'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useHomeAnimations(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const responsiveAnimations = gsap.matchMedia(root)
    responsiveAnimations.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        responsiveAnimations.add('(min-width: 760px)', () => {
          const animeAnimations: JSAnimation[] = []
          const heroChars = root.querySelectorAll<HTMLElement>('[data-hero-char]')
          gsap.fromTo(
            heroChars,
            { yPercent: 120, rotate: 3 },
            { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.035, delay: 0.12 },
          )
          gsap.fromTo(
            root.querySelectorAll<HTMLElement>('[data-hero-fade]'),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, delay: 0.25 },
          )

          animateReveals(root, 0.8, 40, 0.12)

          const parallaxImages = root.querySelectorAll<HTMLElement>('[data-home-parallax]')
          parallaxImages.forEach((image) => {
            gsap.fromTo(
              image,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: 'none',
                scrollTrigger: {
                  trigger: image.parentElement,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              },
            )
          })

          const buildSection = root.querySelector<HTMLElement>('[data-pinned-build]')
          const model = buildSection?.querySelector<HTMLElement>('.build-pc-model')
          const callouts = buildSection?.querySelectorAll<HTMLElement>('[data-build-callout]')
          if (buildSection && model && callouts?.length) {
            const buildTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: buildSection,
                start: 'top top',
                end: '+=1500',
                scrub: 0.8,
                pin: true,
                anticipatePin: 1,
              },
            })
            buildTimeline.to(model, { rotationY: 330, rotationX: 9, ease: 'none' }, 0)
            callouts.forEach((callout, index) => {
              buildTimeline.fromTo(
                callout,
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' },
                0.08 + index * 0.22,
              )
            })
          }

          const pillars = root.querySelector<HTMLElement>('.why-prebuilts__grid')
          const svgPaths = pillars?.querySelectorAll<SVGGeometryElement>(
            '.pillar-card__icon path, .pillar-card__icon circle',
          )
          if (pillars && svgPaths?.length) {
            const drawables = animeSvg.createDrawable(svgPaths)
            const drawing = animeAnimate(drawables, {
              draw: ['0 0', '0 1'],
              delay: animeStagger(100),
              duration: 900,
              ease: 'inOutSine',
              autoplay: false,
            })
            animeAnimations.push(drawing)
            ScrollTrigger.create({
              trigger: pillars,
              start: 'top 85%',
              once: true,
              onEnter: () => drawing.play(),
            })
          }

          const statElements = root.querySelectorAll<HTMLElement>('[data-stat-value]')
          statElements.forEach((stat) => {
            const target = Number(stat.dataset.statValue)
            const counterDisplay = stat.querySelector<HTMLElement>('[data-stat-number]')
            if (!counterDisplay || !Number.isFinite(target)) return

            const counter = { value: 0 }
            const countAnimation = animeAnimate(counter, {
              value: target,
              duration: 900,
              ease: 'out(3)',
              autoplay: false,
              onUpdate: () => {
                counterDisplay.textContent = Math.round(counter.value).toLocaleString()
              },
            })
            animeAnimations.push(countAnimation)
            ScrollTrigger.create({
              trigger: stat,
              start: 'top 85%',
              once: true,
              onEnter: () => countAnimation.play(),
            })
          })

          return () => animeAnimations.forEach((animation) => animation.revert())
        })

        responsiveAnimations.add('(max-width: 759px)', () => {
          animateReveals(root, 0.4, 18, 0)
        })
      }, root)

      return () => context.revert()
    })

    return () => responsiveAnimations.revert()
  }, [rootRef])
}

function animateReveals(root: HTMLElement, duration: number, offset: number, stagger: number) {
  root.querySelectorAll<HTMLElement>('.home-reveal').forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: offset },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      },
    )
  })

  root.querySelectorAll<HTMLElement>('.home-reveal-group').forEach((group) => {
    gsap.fromTo(
      group.querySelectorAll<HTMLElement>('.home-reveal-child'),
      { opacity: 0, y: offset },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    )
  })
}

export default useHomeAnimations
