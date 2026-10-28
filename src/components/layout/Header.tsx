import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { config } from '../../config'
import { useAuthStore } from '../../store/authStore'
import Icon, { type IconName } from './Icon'
import { buildHelpLinks, shopGroups, supportLinks } from './navigation'

type MenuName = 'shop' | 'build' | 'support'

interface HeaderProps {
  cartCount: number
  onOpenCart: () => void
  onMobileMenuChange: (open: boolean) => void
  onOpenSearch: () => void
  scrolled: boolean
  scrollProgressRef: RefObject<HTMLDivElement | null>
}

const desktopMenus: {
  name: MenuName
  label: string
  groups: { label: string; links: { label: string; to: string }[] }[]
}[] = [
  { name: 'shop', label: 'Shop', groups: shopGroups },
  { name: 'build', label: 'Build Help', groups: [{ label: 'Build resources', links: buildHelpLinks }] },
  { name: 'support', label: 'Support', groups: [{ label: 'How can we help?', links: supportLinks }] },
]

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link aria-label={`${config.brandName} home`} className="site-logo" onClick={onClick} to="/">
      <span className="site-logo__mark" aria-hidden="true">P</span>
      <span>{config.brandName}</span>
    </Link>
  )
}

function HeaderAction({
  label,
  name,
  onClick,
  to,
  userName,
}: {
  label: string
  name: IconName
  onClick?: () => void
  to?: string
  userName?: string
}) {
  const contents = <><Icon name={name} />{userName && <span className="header-account-name">{userName.split(/\s+/)[0]}</span>}</>

  if (to) {
    return (
      <Link aria-label={label} className="header-action" to={to}>
        {contents}
      </Link>
    )
  }

  return (
    <button aria-label={label} className="header-action" onClick={onClick} type="button">
      {contents}
    </button>
  )
}

function Header({
  cartCount,
  onOpenCart,
  onMobileMenuChange,
  onOpenSearch,
  scrolled,
  scrollProgressRef,
}: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState<MenuName | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const account = useAuthStore((state) => state.account)

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false)
    setMobileAccordion(null)
  }, [])

  const openSearch = useCallback(() => {
    setOpenMenu(null)
    closeMobileMenu()
    onOpenSearch()
  }, [closeMobileMenu, onOpenSearch])

  const openCart = useCallback(() => {
    setOpenMenu(null)
    closeMobileMenu()
    onOpenCart()
  }, [closeMobileMenu, onOpenCart])

  function handleMobileMenuKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeMobileMenu()
      return
    }

    if (event.key !== 'Tab' || !mobileMenuRef.current) return
    const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href]',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  useEffect(() => {
    if (!openMenu && !mobileOpen) return

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if (event.key === '/' && mobileOpen && !isTyping) {
        event.preventDefault()
        openSearch()
        return
      }

      if (event.key === 'Escape' && openMenu) {
        setOpenMenu(null)
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (
        openMenu &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [mobileOpen, openMenu, openSearch])

  useEffect(() => {
    if (!mobileOpen) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    mobileMenuRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus()

    return () => {
      previousActiveElement?.focus()
    }
  }, [mobileOpen])

  useEffect(() => {
    onMobileMenuChange(mobileOpen)
  }, [mobileOpen, onMobileMenuChange])

  return (
    <>
      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`} ref={dropdownRef}>
        <div className="site-header__inner">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            className="header-action site-header__mobile-trigger"
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>

          <nav aria-label="Main navigation" className="desktop-navigation">
            <Link className="desktop-navigation__link" to="/">Home</Link>
            {desktopMenus.slice(0, 1).map((menu) => (
              <button
                aria-controls={`desktop-${menu.name}-menu`}
                aria-expanded={openMenu === menu.name}
                className={`desktop-navigation__link${openMenu === menu.name ? ' is-active' : ''}`}
                key={menu.name}
                onClick={() => setOpenMenu((current) => current === menu.name ? null : menu.name)}
                type="button"
              >
                {menu.label}<span aria-hidden="true" className="nav-chevron" />
              </button>
            ))}
            <Link className="desktop-navigation__link" to="/customize">Customize PC</Link>
            {desktopMenus.slice(1, 2).map((menu) => (
              <button
                aria-controls={`desktop-${menu.name}-menu`}
                aria-expanded={openMenu === menu.name}
                className={`desktop-navigation__link${openMenu === menu.name ? ' is-active' : ''}`}
                key={menu.name}
                onClick={() => setOpenMenu((current) => current === menu.name ? null : menu.name)}
                type="button"
              >
                {menu.label}<span aria-hidden="true" className="nav-chevron" />
              </button>
            ))}
            <Link className="desktop-navigation__link" to="/sell-parts">Sell Parts</Link>
            {desktopMenus.slice(2).map((menu) => (
              <button
                aria-controls={`desktop-${menu.name}-menu`}
                aria-expanded={openMenu === menu.name}
                className={`desktop-navigation__link${openMenu === menu.name ? ' is-active' : ''}`}
                key={menu.name}
                onClick={() => setOpenMenu((current) => current === menu.name ? null : menu.name)}
                type="button"
              >
                {menu.label}<span aria-hidden="true" className="nav-chevron" />
              </button>
            ))}
          </nav>

          <div className="site-header__brand"><Logo onClick={() => setOpenMenu(null)} /></div>

          <div className="site-header__actions">
            <HeaderAction label="Search" name="search" onClick={openSearch} />
            <HeaderAction label={account ? `Account, ${account.name}` : 'Account'} name="account" to="/account" userName={account?.name} />
            <button
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              className="header-action header-action--cart"
              onClick={openCart}
              type="button"
            >
              <Icon name="cart" />
              <AnimatePresence initial={false} mode="popLayout">
                {cartCount > 0 && (
                  <motion.span
                    animate={{ opacity: 1, scale: [0.7, 1.15, 1] }}
                    aria-hidden="true"
                    className="cart-count"
                    exit={{ opacity: 0, scale: 0.5 }}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    key={cartCount}
                    transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence>
            {openMenu && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={`desktop-dropdown desktop-dropdown--${openMenu}`}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                id={`desktop-${openMenu}-menu`}
                initial={reducedMotion ? false : { opacity: 0, y: -8 }}
                key={openMenu}
                transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
              >
                {desktopMenus.find((menu) => menu.name === openMenu)?.groups.map((group) => (
                  <section className="desktop-dropdown__group" key={group.label}>
                    <h2>{group.label}</h2>
                    <motion.div
                      animate="visible"
                      initial="hidden"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.035 } },
                      }}
                    >
                      {group.links.map((link) => (
                        <motion.div
                          key={link.to}
                          variants={{
                            hidden: reducedMotion ? {} : { opacity: 0, y: 6 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <Link
                            className="desktop-dropdown__link"
                            onClick={() => setOpenMenu(null)}
                            to={link.to}
                          >
                            {link.label}<Icon name="arrow" />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div aria-hidden="true" className="scroll-progress" ref={scrollProgressRef} />
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mobile-menu-backdrop"
            exit={reducedMotion ? undefined : { opacity: 0 }}
            initial={reducedMotion ? false : { opacity: 0 }}
            onClick={closeMobileMenu}
            aria-label="Mobile site navigation"
            aria-modal="true"
            role="dialog"
          >
            <motion.nav
              animate={{ x: 0 }}
              aria-label="Mobile navigation"
              className="mobile-menu"
              id="mobile-navigation"
              initial={reducedMotion ? false : { x: '-100%' }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleMobileMenuKeyDown}
              ref={mobileMenuRef}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mobile-menu__header">
                <Logo onClick={closeMobileMenu} />
                <button aria-label="Close navigation" className="header-action" onClick={closeMobileMenu} type="button">
                  <Icon name="close" />
                </button>
              </div>
              <motion.div
                animate="visible"
                className="mobile-menu__links"
                initial="hidden"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.045, delayChildren: reducedMotion ? 0 : 0.08 } },
                }}
              >
                <motion.div variants={mobileItemVariants(reducedMotion)}>
                  <Link className="mobile-menu__link" onClick={closeMobileMenu} to="/">Home</Link>
                </motion.div>
                {desktopMenus.map((menu) => (
                  <motion.section className="mobile-menu__group" key={menu.name} variants={mobileItemVariants(reducedMotion)}>
                    <button
                      aria-controls={`mobile-${menu.name}-links`}
                      aria-expanded={mobileAccordion === menu.name}
                      className="mobile-menu__link mobile-menu__accordion-trigger"
                      onClick={() => setMobileAccordion((current) => current === menu.name ? null : menu.name)}
                      type="button"
                    >
                      {menu.label}<span aria-hidden="true" className={`nav-chevron${mobileAccordion === menu.name ? ' nav-chevron--up' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileAccordion === menu.name && (
                        <motion.div
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mobile-menu__accordion"
                          exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                          id={`mobile-${menu.name}-links`}
                          initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        >
                          {menu.groups.flatMap((group) => group.links).map((link) => (
                            <Link className="mobile-menu__sublink" key={link.to} onClick={closeMobileMenu} to={link.to}>
                              {link.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                ))}
                <motion.div variants={mobileItemVariants(reducedMotion)}>
                  <Link className="mobile-menu__link" onClick={closeMobileMenu} to="/customize">Customize PC</Link>
                </motion.div>
                <motion.div variants={mobileItemVariants(reducedMotion)}>
                  <Link className="mobile-menu__link" onClick={closeMobileMenu} to="/sell-parts">Sell Parts</Link>
                </motion.div>
                <motion.div variants={mobileItemVariants(reducedMotion)}>
                  <Link className="mobile-menu__link" onClick={closeMobileMenu} to="/account">{account ? `Account · ${account.name}` : 'Account'}</Link>
                </motion.div>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Quick navigation" className="mobile-tab-bar">
        <Link aria-label="Home" className="mobile-tab-bar__item" to="/">
          <Icon name="home" /><span>Home</span>
        </Link>
        <Link aria-label="Shop" className="mobile-tab-bar__item" to="/shop">
          <Icon name="cart" /><span>Shop</span>
        </Link>
        <button aria-label="Search" className="mobile-tab-bar__item" onClick={openSearch} type="button">
          <Icon name="search" /><span>Search</span>
        </button>
        <button aria-label={`Cart, ${cartCount} items`} className="mobile-tab-bar__item mobile-tab-bar__cart" onClick={openCart} type="button">
          <Icon name="cart" />{cartCount > 0 && <span className="mobile-tab-bar__count">{cartCount > 99 ? '99+' : cartCount}</span>}<span>Cart</span>
        </button>
        <Link aria-label={account ? `Account, ${account.name}` : 'Account'} className="mobile-tab-bar__item" to="/account">
          <Icon name="account" /><span>{account ? account.name.split(/\s+/)[0] : 'Account'}</span>
        </Link>
      </nav>
    </>
  )
}

function mobileItemVariants(reducedMotion: boolean | null) {
  return {
    hidden: reducedMotion ? {} : { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  }
}

export default Header
