import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/layout/Icon'
import LazyImage from '../components/ui/LazyImage'
import AddToCartButton from '../components/shop/AddToCartButton'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import { parts } from '../data/parts'
import { prebuilts } from '../data/prebuilts'
import { currencyFormatter } from '../config'
import { getCartEta } from '../lib/delivery'
import { useCartStore, type CartItemProduct, type CartLineItem } from '../store/cartStore'

function Cart() {
  const items = useCartStore((state) => state.items)
  const couponCode = useCartStore((state) => state.couponCode)
  const updateQty = useCartStore((state) => state.updateQty)
  const remove = useCartStore((state) => state.remove)
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const clearCoupon = useCartStore((state) => state.clearCoupon)
  const getTotals = useCartStore((state) => state.getTotals)
  const [couponInput, setCouponInput] = useState(couponCode ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const totals = getTotals()
  const shippableItems = items.filter(
    (item): item is Exclude<CartLineItem, { kind: 'digital' }> => item.kind !== 'digital',
  )
  const cartEta = shippableItems.length ? getCartEta(shippableItems) : null

  function submitCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (applyCoupon(couponInput)) {
      setCouponMessage(`${couponInput.trim().toUpperCase()} applied.`)
      return
    }

    setCouponMessage('That coupon code is not valid. Try WELCOME10 or BUILD5.')
  }

  return (
    <Container className="cart-page">
      <header className="cart-page__heading">
        <p className="destination-page__eyebrow">YOUR PCFORGE CART</p>
        <h1>Your cart<span>.</span></h1>
        <p>{items.length ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready for their next build.` : 'Your next build starts here.'}</p>
      </header>

      {items.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty__message">
            <span aria-hidden="true"><Icon name="cart" /></span>
            <p className="destination-page__eyebrow">NOTHING IN THE CART</p>
            <h2>Let’s find your next upgrade.</h2>
            <p>Explore a ready-to-play PC or choose the parts that fit your build.</p>
            <Link className="ui-button ui-button--primary" to="/shop">Continue shopping <Icon name="arrow" /></Link>
          </div>
          <SuggestedProducts />
        </section>
      ) : (
        <div className="cart-layout">
          <section aria-label="Cart items" className="cart-lines">
            {items.map((item) => (
              <article className="cart-line" key={`${item.kind}-${item.id}`}>
                <Link aria-label={`View ${item.name}`} className="cart-line__image" to={item.kind === 'prebuilt' ? `/prebuilts/${item.id}` : item.kind === 'part' ? `/parts/${item.id}` : '/customize'}>
                  <LazyImage alt="" loading="lazy" src={getItemImage(item)} />
                </Link>
                <div className="cart-line__content">
                  <div className="cart-line__top">
                    <div>
                      <p className="destination-page__eyebrow">{getItemType(item)}</p>
                      <h2>{item.name}</h2>
                    </div>
                    <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
                  </div>
                  {item.kind === 'custom-build' && (
                    <details className="cart-line__parts">
                      <summary>View included parts ({item.parts.length})</summary>
                      <ul>
                        {item.parts.map((part) => <li key={part.id}>{part.category}: {part.brand} {part.name}</li>)}
                      </ul>
                    </details>
                  )}
                  {item.kind === 'digital' ? (
                    <span className="cart-line__instant">Available immediately</span>
                  ) : (
                    <DeliveryBadge item={item} />
                  )}
                  <div className="cart-line__controls">
                    <div aria-label={`Quantity for ${item.name}`} className="cart-quantity">
                      <button aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQty(item.id, item.quantity - 1)} type="button">−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 10} onClick={() => updateQty(item.id, item.quantity + 1)} type="button">+</button>
                    </div>
                    <button className="cart-line__remove" onClick={() => remove(item.id)} type="button">Remove</button>
                  </div>
                </div>
              </article>
            ))}

            {cartEta && (
              <div className="cart-arrival">
                <span>Estimated arrival for your order</span>
                <DeliveryBadge eta={cartEta} />
              </div>
            )}
            <Link className="cart-continue" to="/shop"><Icon name="arrow" /> Continue shopping</Link>
          </section>

          <aside aria-label="Cart totals" className="cart-summary">
            <p className="destination-page__eyebrow">ORDER SUMMARY</p>
            <h2>Price breakdown</h2>
            <form className="cart-coupon" onSubmit={submitCoupon}>
              <label htmlFor="cart-coupon-code">Coupon code</label>
              <div>
                <input autoComplete="off" id="cart-coupon-code" onChange={(event) => setCouponInput(event.target.value)} placeholder="WELCOME10" value={couponInput} />
                <button className="ui-button ui-button--outline" type="submit">Apply</button>
              </div>
              {couponCode && <button className="cart-coupon__remove" onClick={() => { clearCoupon(); setCouponMessage('Coupon removed.') }} type="button">Remove {couponCode}</button>}
              <span aria-live="polite" className="cart-coupon__message">{couponMessage}</span>
            </form>
            <div className="checkout-summary__totals">
              <div><span>Subtotal</span><b>{currencyFormatter.format(totals.subtotal)}</b></div>
              {totals.discount > 0 && <div><span>Discount{couponCode ? ` · ${couponCode}` : ''}</span><b>−{currencyFormatter.format(totals.discount)}</b></div>}
              <div><span>Tax</span><b>{currencyFormatter.format(totals.tax)}</b></div>
              <div><span>Shipping</span><b>{totals.shipping ? currencyFormatter.format(totals.shipping) : 'Free'}</b></div>
              <div className="checkout-summary__total"><strong>Total</strong><strong>{currencyFormatter.format(totals.total)}</strong></div>
            </div>
            <Link className="ui-button ui-button--primary cart-summary__checkout" to="/checkout">Proceed to Checkout <Icon name="arrow" /></Link>
            <p className="cart-summary__note">Delivery times are estimates. Priority dispatch is available during checkout.</p>
          </aside>
        </div>
      )}
    </Container>
  )
}

function SuggestedProducts() {
  const suggestions: CartItemProduct[] = [
    ...prebuilts.slice(0, 2).map((item) => ({ ...item, kind: 'prebuilt' as const })),
    ...parts.slice(0, 2).map((item) => ({ ...item, kind: 'part' as const })),
  ]

  return (
    <section aria-labelledby="cart-suggestions-title" className="cart-suggestions">
      <p className="destination-page__eyebrow">HAND-PICKED FOR YOU</p>
      <h2 id="cart-suggestions-title">Start with a favorite.</h2>
      <div className="cart-suggestions__grid">
        {suggestions.map((item) => (
          <article className="cart-suggestion" key={`${item.kind}-${item.id}`}>
            <LazyImage alt="" loading="lazy" src={getItemImage(item)} />
            <div>
              <span>{getItemType(item)}</span>
              <h3>{item.name}</h3>
              <strong>{currencyFormatter.format(item.price)}</strong>
            </div>
            <AddToCartButton aria-label={`Add ${item.name} to cart`} className="cart-suggestion__add" item={item} label="+" />
          </article>
        ))}
      </div>
    </section>
  )
}

function getItemImage(item: CartItemProduct): string {
  if (item.kind === 'part' || item.kind === 'digital') return item.image
  if (item.kind === 'prebuilt') return item.images[0] ?? ''
  return item.image ?? item.parts[0]?.image ?? ''
}

function getItemType(item: CartItemProduct): string {
  if (item.kind === 'part') return item.category
  if (item.kind === 'prebuilt') return item.category
  if (item.kind === 'custom-build') return 'CUSTOM BUILD'
  return 'DIGITAL GUIDE'
}

export default Cart
