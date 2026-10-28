import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { currencyFormatter } from '../../config'
import { getCartEta } from '../../lib/delivery'
import DeliveryBadge from '../ui/DeliveryBadge'
import { useCartStore } from '../../store/cartStore'
import Icon from './Icon'
import LazyImage from '../ui/LazyImage'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

function getImage(item: ReturnType<typeof useCartStore.getState>['items'][number]): string | undefined {
  if (item.kind === 'part') return item.image
  if (item.kind === 'prebuilt') return item.images[0]
  if (item.kind === 'digital') return item.image
  return item.image
}

function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items)
  const remove = useCartStore((state) => state.remove)
  const updateQty = useCartStore((state) => state.updateQty)
  const subtotal = useCartStore((state) => state.subtotal())
  const deliveryItems = items.filter((item) => item.kind !== 'digital')
  const cartEta = deliveryItems.length > 0 ? getCartEta(deliveryItems) : null
  const reducedMotion = useReducedMotion()
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    const drawer = drawerRef.current
    const focusableSelector = 'button:not([disabled]), a[href]'
    drawer?.querySelector<HTMLElement>(focusableSelector)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !drawer) return
      const focusable = drawer.querySelectorAll<HTMLElement>(focusableSelector)
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

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previousActiveElement?.focus()
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="overlay-backdrop cart-backdrop"
          exit={reducedMotion ? undefined : { opacity: 0 }}
          initial={reducedMotion ? false : { opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.aside
            animate={{ x: 0 }}
            aria-label="Shopping cart"
            aria-modal="true"
            className="cart-drawer"
            initial={reducedMotion ? false : { x: '100%' }}
            onClick={(event) => event.stopPropagation()}
            ref={drawerRef}
            role="dialog"
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
          >
            <header className="cart-drawer__header">
              <div>
                <p className="cart-drawer__eyebrow">YOUR BUILD</p>
                <h2>Your cart <span>({items.reduce((count, item) => count + item.quantity, 0)})</span></h2>
              </div>
              <button aria-label="Close cart" className="header-action" onClick={onClose} type="button">
                <Icon name="close" />
              </button>
            </header>

            {items.length > 0 ? (
              <>
                <ul className="cart-drawer__items">
                  {items.map((item) => {
                    const image = getImage(item)
                    return (
                    <li className="cart-line" key={`${item.kind}-${item.id}`}>
                      {image ? <LazyImage alt="" className="cart-line__image" loading="lazy" src={image} /> : <div aria-hidden="true" className="cart-line__image cart-line__placeholder">PC</div>}
                      <div className="cart-line__content">
                        <div className="cart-line__top">
                          <div>
                            <strong>{item.name}</strong>
                            <span className="cart-line__type">
                              {item.kind === 'custom-build'
                                ? 'Custom build'
                                : item.kind === 'prebuilt'
                                  ? item.category
                                  : item.kind === 'digital'
                                    ? 'Digital download'
                                    : item.category}
                            </span>
                          </div>
                          <button aria-label={`Remove ${item.name}`} className="cart-line__remove" onClick={() => remove(item.id)} type="button">Remove</button>
                        </div>
                        <div className="cart-line__bottom">
                          <div aria-label={`${item.name} quantity`} className="quantity-stepper">
                            <button
                              aria-label={`Decrease ${item.name} quantity`}
                              disabled={item.quantity <= 1}
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              type="button"
                            >−</button>
                            <span aria-live="polite">{item.quantity}</span>
                            <button
                              aria-label={`Increase ${item.name} quantity`}
                              disabled={item.quantity >= 10}
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              type="button"
                            >+</button>
                          </div>
                          <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
                        </div>
                        {item.kind === 'digital'
                          ? <span className="delivery-badge">Instant digital access after checkout</span>
                          : <DeliveryBadge item={item} />}
                      </div>
                    </li>
                    )
                  })}
                </ul>
                <div className="cart-drawer__summary">
                  {cartEta && (
                    <div className="cart-drawer__delivery">
                      <span>Estimated cart delivery</span>
                      <DeliveryBadge eta={cartEta} />
                    </div>
                  )}
                  <div className="cart-drawer__subtotal"><span>Subtotal</span><strong>{currencyFormatter.format(subtotal)}</strong></div>
                  <p>Shipping and taxes calculated at checkout.</p>
                  <Link className="ui-button ui-button--outline cart-drawer__view" onClick={onClose} to="/cart">View Cart</Link>
                  <Link className="ui-button ui-button--primary cart-drawer__checkout" onClick={onClose} to="/checkout">Checkout <Icon name="arrow" /></Link>
                </div>
              </>
            ) : (
              <div className="cart-drawer__empty">
                <span aria-hidden="true" className="cart-drawer__empty-icon"><Icon name="cart" /></span>
                <h3>Your cart is empty</h3>
                <p>Find the parts and gear for your next build.</p>
                <Link className="ui-button ui-button--primary" onClick={onClose} to="/shop">Explore the shop <Icon name="arrow" /></Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
