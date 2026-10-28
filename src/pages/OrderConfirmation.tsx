import { LottieLight } from 'lottie-react'
import { useReducedMotion } from 'motion/react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import Icon from '../components/layout/Icon'
import { config, currencyFormatter } from '../config'
import { formatDeliveryDate } from '../lib/delivery'
import { useOrderStore, type Order, type OrderEta } from '../store/orderStore'

const successAnimation = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 36,
  w: 100,
  h: 100,
  nm: 'PCForge order success',
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: 'Success ring',
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [65, 65, 100] },
          { t: 18, s: [100, 100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [{
      ty: 'gr',
      it: [
        { d: 1, ty: 'el', s: { a: 0, k: [78, 78] }, p: { a: 0, k: [0, 0] }, nm: 'Circle' },
        { ty: 'st', c: { a: 0, k: [0.133, 0.77, 0.35, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 5 }, lc: 2, lj: 2, ml: 4, nm: 'Green stroke' },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }, nm: 'Transform' },
      ],
      nm: 'Circle group',
    }],
    ip: 0,
    op: 36,
    st: 0,
    bm: 0,
  }],
}

function OrderDelivery({ eta }: { eta: OrderEta }) {
  if (eta.days === 0) return <small>Available immediately</small>

  return (
    <DeliveryBadge
      eta={{
        days: eta.days,
        arrivalDate: new Date(eta.arrivalDate),
        label: eta.label,
      }}
    />
  )
}

function OrderConfirmation() {
  const { id } = useParams()
  const reducedMotion = useReducedMotion()
  const order = useOrderStore((state) => state.getOrder(id ?? ''))

  if (!order) return <Navigate replace to="/" />

  const hasShippableItems = order.items.some((item) => item.kind !== 'digital')
  const orderDate = new Intl.DateTimeFormat(config.locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(order.placedAt))
  const customerName = getCustomerName(order)
  const arrivalDate = new Date(order.eta.arrivalDate)
  const overallArrival = order.eta.days === 0
    ? 'Available immediately'
    : `Arrives by ${formatDeliveryDate(arrivalDate)}, in ${order.eta.days} days`

  return (
    <div className="order-confirmation" id="order-invoice">
      <Container>
        <header className="order-confirmation__hero">
          <div aria-label="Order placed successfully" className="order-confirmation__animation" role="img">
            <LottieLight autoplay={!reducedMotion} loop={false} src={successAnimation} />
            <Icon name="check" />
          </div>
          <p className="destination-page__eyebrow">SIMULATED ORDER CONFIRMED</p>
          <h1>Order Placed Successfully<span>.</span></h1>
          <p>Thank you, {order.customer.name ?? customerName}. Your demo order is saved in this browser.</p>
          <div className="order-confirmation__number"><span>ORDER ID</span><strong>{order.id}</strong></div>
          <p className="order-confirmation__placed-at">Placed {orderDate}</p>
        </header>

        <section aria-label="Order status timeline" className="order-timeline" id="order-timeline">
          <p className="destination-page__eyebrow">WHAT HAPPENS NEXT</p>
          <ol>
            {order.timeline.map((entry, index) => (
              <li className={index === 0 ? 'is-current' : ''} key={entry.status}>
                <span aria-hidden="true">{index === 0 ? <Icon name="check" /> : index + 1}</span>
                <strong>{entry.label}</strong>
                <small>{entry.at ? new Intl.DateTimeFormat(config.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.at)) : 'Upcoming'}</small>
              </li>
            ))}
          </ol>
        </section>

        <div className="order-confirmation__grid">
          <section aria-labelledby="confirmation-items-title" className="order-confirmation__section">
            <p className="destination-page__eyebrow">YOUR BUILD · PARTS · GEAR</p>
            <h2 id="confirmation-items-title">Order details</h2>
            <ul className="order-confirmation__items">
              {order.items.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <span className="order-confirmation__item">
                    <strong>{item.name}</strong>
                    <small>Quantity {item.quantity} · {item.kind === 'custom-build' ? 'Custom PC build' : item.kind === 'prebuilt' ? 'Prebuilt PC' : item.kind === 'digital' ? 'Digital' : item.category}</small>
                    {item.kind === 'custom-build' && (
                      <details className="cart-line__parts">
                        <summary>Included parts ({item.parts.length})</summary>
                        <ul>{item.parts.map((part) => <li key={part.id}>{part.category}: {part.brand} {part.name}</li>)}</ul>
                      </details>
                    )}
                    <OrderDelivery eta={item.eta} />
                  </span>
                  <b>{currencyFormatter.format(item.price * item.quantity)}</b>
                </li>
              ))}
            </ul>
            <div className="order-confirmation__eta">
              <span>Estimated delivery</span>
              <strong>{overallArrival}</strong>
            </div>
            <div className="checkout-summary__totals">
              <div><span>Subtotal</span><b>{currencyFormatter.format(order.totals.subtotal)}</b></div>
              {order.totals.discount > 0 && <div><span>Discount</span><b>−{currencyFormatter.format(order.totals.discount)}</b></div>}
              <div><span>Tax</span><b>{currencyFormatter.format(order.totals.tax)}</b></div>
              <div><span>Shipping</span><b>{order.totals.shipping ? currencyFormatter.format(order.totals.shipping) : 'Free'}</b></div>
              {(order.totals.priorityFee ?? order.delivery?.priorityFee ?? 0) > 0 && (
                <div><span>Priority dispatch</span><b>{currencyFormatter.format(order.totals.priorityFee ?? order.delivery.priorityFee)}</b></div>
              )}
              <div className="checkout-summary__total"><strong>Order total</strong><strong>{currencyFormatter.format(order.totals.total)}</strong></div>
            </div>
          </section>

          <aside className="order-confirmation__side">
            <section className="order-confirmation__section">
              <p className="destination-page__eyebrow">SHIPPING ADDRESS</p>
              <h2>{customerName}</h2>
              <address>
                {order.address.line1}{order.address.line2 && <><br />{order.address.line2}</>}<br />
                {order.address.city}, {order.address.state} {order.address.postalCode}<br />
                {order.address.country}
              </address>
              <p>{order.customer.email}<br />{order.customer.phone}</p>
            </section>
            <section className="order-confirmation__section">
              <p className="destination-page__eyebrow">PAYMENT METHOD</p>
              <h2>{getPaymentLabel(order)}</h2>
              {order.payment.last4 && <p>Card ending in •••• {order.payment.last4}</p>}
              {order.payment.method === 'upi' && <p>{order.payment.provider}</p>}
              <small>Demo payment · no charge made</small>
            </section>
            <section className="order-confirmation__section">
              <p className="destination-page__eyebrow">DELIVERY METHOD</p>
              <h2>{!hasShippableItems ? 'Digital delivery' : order.delivery?.method === 'priority' ? 'Priority dispatch' : 'Standard delivery'}</h2>
              {order.delivery?.method === 'priority' && <p>Priority dispatch fee: {currencyFormatter.format(order.delivery.priorityFee)}</p>}
              {!hasShippableItems && <p>Digital items are available immediately; no shipping is required.</p>}
              {hasShippableItems && <small>Dispatch choice does not change the estimated arrival date.</small>}
            </section>
          </aside>
        </div>

        <div className="order-confirmation__actions">
          <a className="ui-button ui-button--outline" href="#order-timeline">Track Order</a>
          <Link className="ui-button ui-button--primary" to="/shop">Continue Shopping <Icon name="arrow" /></Link>
          <button className="ui-button ui-button--ghost" onClick={() => window.print()} type="button">Print Invoice</button>
        </div>
      </Container>
    </div>
  )
}

function getCustomerName(order: Order): string {
  return order.customer.name ?? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ')
}

function getPaymentLabel(order: Order): string {
  if (order.payment.method === 'cash-on-delivery') return 'Cash on delivery'
  if (order.payment.method === 'upi') return 'UPI'
  return `${order.payment.provider ?? 'Card'} payment`
}

export default OrderConfirmation
