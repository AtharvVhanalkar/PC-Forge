import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import Icon from '../components/layout/Icon'
import { config, currencyFormatter } from '../config'
import { formatDeliveryDate } from '../lib/delivery'
import { useOrderStore, type Order, type OrderEta } from '../store/orderStore'

function OrderEtaBadge({ eta }: { eta: OrderEta }) {
  if (eta.days === 0) return <small>Available immediately</small>
  const days = eta.days === 4 ? 4 : eta.days === 6 ? 6 : 10
  return <DeliveryBadge eta={{ ...eta, days, arrivalDate: new Date(eta.arrivalDate) }} />
}

function Orders() {
  const orders = useOrderStore((state) => state.orders)

  return (
    <Container className="account-page orders-page">
      <header className="destination-page__header">
        <p className="destination-page__eyebrow">YOUR PCFORGE ACCOUNT</p>
        <h1>Your orders<span>.</span></h1>
        <p>Every simulated order saved in this browser.</p>
      </header>
      {orders.length === 0 ? (
        <section className="account-empty">
          <h2>No orders just yet.</h2>
          <p>Placed orders will appear here with their delivery estimates and status.</p>
          <Link className="ui-button ui-button--primary" to="/shop">Explore the shop <Icon name="arrow" /></Link>
        </section>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-list-card" key={order.id}>
              <div className="order-list-card__top">
                <div><p className="destination-page__eyebrow">{order.id}</p><strong>{formatOrderDate(order.placedAt)}</strong></div>
                <span className={`order-status order-status--${order.status}`}>{formatStatus(order.status)}</span>
              </div>
              <div className="order-list-card__items">
                {order.items.slice(0, 3).map((item) => <span key={`${item.kind}-${item.id}`}>{item.name} × {item.quantity}</span>)}
                {order.items.length > 3 && <span>+{order.items.length - 3} more item types</span>}
              </div>
              <div className="order-list-card__bottom">
                <span>{order.eta.days === 0 ? 'Digital delivery' : `Est. arrival ${formatDeliveryDate(new Date(order.eta.arrivalDate))}`}</span>
                <strong>{currencyFormatter.format(order.totals.total)}</strong>
                <Link aria-label={`View order ${order.id}`} to={`/orders/${order.id}`}>View details <Icon name="arrow" /></Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <Link className="orders-track-link" to="/track-order">Track an order by ID <Icon name="arrow" /></Link>
    </Container>
  )
}

function OrderDetails({ order }: { order: Order }) {
  const customerName = order.customer.name ?? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ')

  return (
    <Container className="account-page order-detail-page">
      <Link className="account-back-link" to="/orders">← All orders</Link>
      <header className="destination-page__header">
        <p className="destination-page__eyebrow">{order.id}</p>
        <h1>Order details<span>.</span></h1>
        <p>Placed {formatOrderDate(order.placedAt)} · <span className={`order-status order-status--${order.status}`}>{formatStatus(order.status)}</span></p>
      </header>
      <section className="order-timeline">
        <p className="destination-page__eyebrow">ORDER STATUS</p>
        <ol>
          {order.timeline.map((entry, index) => (
            <li className={entry.at ? 'is-current' : ''} key={entry.status}>
              <span aria-hidden="true">{entry.at ? <Icon name="check" /> : index + 1}</span>
              <strong>{entry.label}</strong>
              <small>{entry.at ? formatOrderDate(entry.at) : 'Upcoming'}</small>
            </li>
          ))}
        </ol>
      </section>
      <div className="order-detail-grid">
        <section className="order-detail-card">
          <p className="destination-page__eyebrow">ITEMS</p>
          {order.items.map((item) => (
            <article className="order-detail-item" key={`${item.kind}-${item.id}`}>
              <div><strong>{item.name}</strong><span>Qty {item.quantity} · {item.kind === 'custom-build' ? 'Custom build' : item.kind === 'prebuilt' ? 'Prebuilt PC' : item.kind === 'digital' ? 'Digital' : item.category}</span>
                {item.kind === 'custom-build' && <details><summary>Included parts ({item.parts.length})</summary><ul>{item.parts.map((part) => <li key={part.id}>{part.category}: {part.name}</li>)}</ul></details>}
                <OrderEtaBadge eta={item.eta} />
              </div>
              <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
            </article>
          ))}
          <div className="order-price-breakdown">
            <div><span>Subtotal</span><strong>{currencyFormatter.format(order.totals.subtotal)}</strong></div>
            {order.totals.discount > 0 && <div><span>Discount</span><strong>−{currencyFormatter.format(order.totals.discount)}</strong></div>}
            <div><span>Tax</span><strong>{currencyFormatter.format(order.totals.tax)}</strong></div>
            <div><span>Shipping</span><strong>{order.totals.shipping ? currencyFormatter.format(order.totals.shipping) : 'Free'}</strong></div>
            {(order.totals.priorityFee ?? 0) > 0 && <div><span>Priority dispatch</span><strong>{currencyFormatter.format(order.totals.priorityFee ?? 0)}</strong></div>}
            <div className="order-price-breakdown__total"><strong>Order total</strong><strong>{currencyFormatter.format(order.totals.total)}</strong></div>
          </div>
        </section>
        <aside className="order-detail-aside">
          <section className="order-detail-card">
            <p className="destination-page__eyebrow">ESTIMATED ARRIVAL</p>
            <h2>{order.eta.days === 0 ? 'Available immediately' : `Arrives by ${formatDeliveryDate(new Date(order.eta.arrivalDate))}`}</h2>
            {order.eta.days > 0 && <p>{order.eta.days} days · {order.delivery?.method === 'priority' ? 'Priority dispatch' : 'Standard delivery'}</p>}
          </section>
          <section className="order-detail-card">
            <p className="destination-page__eyebrow">SHIP TO</p>
            <h2>{customerName}</h2>
            <address>{order.address.line1}{order.address.line2 && <><br />{order.address.line2}</>}<br />{order.address.city}, {order.address.state} {order.address.postalCode}<br />{order.address.country}</address>
            <p>{order.customer.email}<br />{order.customer.phone}</p>
          </section>
          <section className="order-detail-card">
            <p className="destination-page__eyebrow">PAYMENT</p>
            <h2>{getPaymentLabel(order)}</h2>
            {order.payment.last4 && <p>Card ending in •••• {order.payment.last4}</p>}
            {order.payment.method === 'upi' && <p>{order.payment.provider}</p>}
            <small>Demo only · no payment taken</small>
          </section>
          <Link className="ui-button ui-button--outline" to="/track-order">Track Order</Link>
        </aside>
      </div>
    </Container>
  )
}

function OrderTracking() {
  const [query, setQuery] = useState('')
  const [lookupId, setLookupId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const order = useOrderStore((state) => state.getOrder(lookupId))

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLookupId(query.trim().toUpperCase())
    setSubmitted(true)
  }

  return (
    <Container className="account-page order-tracking-page">
      <header className="destination-page__header">
        <p className="destination-page__eyebrow">ORDER SUPPORT</p>
        <h1>Track your order<span>.</span></h1>
        <p>Enter the order ID shown on your confirmation page. Orders are stored only in this browser.</p>
      </header>
      <form className="order-tracking-form" onSubmit={submitLookup}>
        <label htmlFor="order-lookup-id">Order ID</label>
        <div><input autoComplete="off" id="order-lookup-id" onChange={(event) => setQuery(event.target.value)} placeholder="PCF-2026-12345" required value={query} /><button className="ui-button ui-button--primary" type="submit">Find order <Icon name="arrow" /></button></div>
      </form>
      {submitted && (order ? (
        <article className="order-track-result">
          <div><p className="destination-page__eyebrow">{order.id}</p><span className={`order-status order-status--${order.status}`}>{formatStatus(order.status)}</span></div>
          <h2>{order.items.length === 1 ? order.items[0]?.name : `${order.items.length} item types`}</h2>
          <p>Placed {formatOrderDate(order.placedAt)} · {order.eta.days === 0 ? 'Available immediately' : `Arrives by ${formatDeliveryDate(new Date(order.eta.arrivalDate))} (${order.eta.days} days)`}</p>
          <Link className="ui-button ui-button--outline" to={`/orders/${order.id}`}>View full order details <Icon name="arrow" /></Link>
        </article>
      ) : (
        <p className="order-tracking-error" role="alert">No order with that ID was found in this browser. Check the ID and try again.</p>
      ))}
    </Container>
  )
}

function OrderDetailRoute() {
  const { id = '' } = useParams()
  const order = useOrderStore((state) => state.getOrder(id))
  if (!order) return <Navigate replace to="/orders" />
  return <OrderDetails order={order} />
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat(config.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatStatus(status: Order['status']) {
  return status.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getPaymentLabel(order: Order) {
  if (order.payment.method === 'cash-on-delivery') return 'Cash on delivery'
  if (order.payment.method === 'upi') return 'UPI'
  return `${order.payment.provider ?? 'Card'}`
}

export { OrderDetailRoute, OrderTracking }
export default Orders
