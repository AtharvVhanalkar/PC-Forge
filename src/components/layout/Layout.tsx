import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { config } from '../../config'
import { useCartStore } from '../../store/cartStore'
import AnnouncementBar from './AnnouncementBar'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import SearchOverlay from './SearchOverlay'
import Toast from '../ui/Toast'

const ScrollEffects = lazy(() => import('./ScrollEffects'))
const InteractionEffects = lazy(() => import('./InteractionEffects'))

function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartAddedToast, setCartAddedToast] = useState(false)
  const [desktopScrollEffectsEnabled, setDesktopScrollEffectsEnabled] = useState(false)
  const [desktopPointerEffectsEnabled, setDesktopPointerEffectsEnabled] = useState(false)
  const scrollProgressRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    const scrollEffectsQuery = window.matchMedia(
      '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
    )
    const pointerEffectsQuery = window.matchMedia(
      '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )

    function updateEffects() {
      setDesktopScrollEffectsEnabled(scrollEffectsQuery.matches && !reducedMotion)
      setDesktopPointerEffectsEnabled(pointerEffectsQuery.matches && !reducedMotion)
    }

    updateEffects()
    scrollEffectsQuery.addEventListener('change', updateEffects)
    pointerEffectsQuery.addEventListener('change', updateEffects)
    return () => {
      scrollEffectsQuery.removeEventListener('change', updateEffects)
      pointerEffectsQuery.removeEventListener('change', updateEffects)
    }
  }, [reducedMotion])

  const closeCart = useCallback(() => setCartOpen(false), [])
  const openCart = useCallback(() => {
    setSearchOpen(false)
    setCartOpen(true)
  }, [])
  const openSearch = useCallback(() => {
    setCartOpen(false)
    setSearchOpen(true)
  }, [])

  useEffect(() => {
    function updateScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const shouldShrinkHeader = window.scrollY > 80
      setScrolled((current) => current === shouldShrinkHeader ? current : shouldShrinkHeader)
      const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
      scrollProgressRef.current?.style.setProperty('transform', `scaleX(${progress})`)
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  useEffect(() => {
    let previousItems = useCartStore.getState().items
    let openDrawerTimer = 0
    const unsubscribe = useCartStore.subscribe((state) => {
      const hasAddedItems = state.items.some((item) => {
        const previous = previousItems.find((line) => line.id === item.id && line.kind === item.kind)
        return !previous || item.quantity > previous.quantity
      })
      if (hasAddedItems) {
        window.clearTimeout(openDrawerTimer)
        openDrawerTimer = window.setTimeout(() => {
          if (window.location.pathname !== '/checkout') {
            setCartOpen(true)
            setCartAddedToast(true)
          }
        }, 650)
      }
      previousItems = state.items
    })

    return () => {
      window.clearTimeout(openDrawerTimer)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping) {
        event.preventDefault()
        setCartOpen(false)
        setSearchOpen(true)
      }

      if (event.key === 'Escape') {
        setSearchOpen(false)
        setCartOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.title = `${getPageTitle(location.pathname)} | ${config.brandName}`
  }, [location.pathname])

  useEffect(() => {
    const hasModal = searchOpen || cartOpen || mobileMenuOpen
    if (!hasModal) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [cartOpen, mobileMenuOpen, searchOpen])

  return (
    <div className="app-shell">
      <Suspense fallback={null}>
        {desktopScrollEffectsEnabled && <ScrollEffects paused={searchOpen || cartOpen || mobileMenuOpen} />}
        {desktopPointerEffectsEnabled && <InteractionEffects />}
      </Suspense>
      {cartAddedToast && (
        <Toast
          actionLabel="View Cart"
          message="Added to cart"
          onAction={() => {
            setCartAddedToast(false)
            setCartOpen(false)
            navigate('/cart')
          }}
          onDismiss={() => setCartAddedToast(false)}
        />
      )}
      <AnnouncementBar />
      <Header
        cartCount={cartCount}
        onMobileMenuChange={setMobileMenuOpen}
        onOpenCart={openCart}
        onOpenSearch={openSearch}
        scrolled={scrolled}
        scrollProgressRef={scrollProgressRef}
      />
      <AnimatePresence>
        {searchOpen && <SearchOverlay key="search" onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <AnimatePresence initial={false} mode="wait">
        <motion.main
          animate={{ opacity: 1, x: 0 }}
          className="page-content"
          exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
          initial={reducedMotion ? false : { opacity: 0, x: 12 }}
          key={location.pathname}
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Home'
  if (pathname === '/styleguide') return 'Styleguide'
  if (pathname === '/orders') return 'Your Orders'
  if (pathname.startsWith('/orders/')) return 'Order Details'
  if (pathname === '/track-order') return 'Track Order'
  if (pathname === '/support') return 'Customer Support'
  if (pathname === '/faq' || pathname === '/support/faq-shipping') return 'FAQ & Shipping'
  if (pathname === '/warranty' || pathname === '/support/warranty-returns') return 'Warranty & Returns'
  if (pathname === '/account') return 'Account'
  if (pathname === '/login') return 'Sign In'
  if (pathname === '/register') return 'Create Account'
  if (pathname.startsWith('/build-help/')) {
    const section = pathname.split('/').filter(Boolean).at(-1)
    if (section) return section.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  }
  if (pathname.startsWith('/order-confirmation/')) return 'Order Confirmation'
  if (pathname === '/sell-parts/requests') return 'My Sell Requests'
  if (pathname.startsWith('/sell-parts/requests/')) return 'Sell Request'
  const words = pathname.split('/').filter(Boolean).map((part) =>
    part.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
  )
  return words.at(-1) ?? 'Home'
}

export default Layout
