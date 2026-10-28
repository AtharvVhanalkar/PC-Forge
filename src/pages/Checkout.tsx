import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'
import { formatCardExpiry, formatCardNumber, detectCardBrand, isValidCardExpiry, isValidCardNumber } from '../lib/checkout'
import { getCartEta, getItemEta } from '../lib/delivery'
import { useCartStore, type CartLineItem } from '../store/cartStore'
import { useOrderStore, type OrderAddress, type OrderCustomer, type OrderDelivery, type OrderPayment } from '../store/orderStore'

const PRIORITY_DISPATCH_FEE = 19.99
const EMPTY_FIELDS = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  upiId: '',
}

type CheckoutStep = 1 | 2 | 3

function Checkout() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const processingTimer = useRef<number | null>(null)
  const items = useCartStore((state) => state.items)
  const getTotals = useCartStore((state) => state.getTotals)
  const clearCart = useCartStore((state) => state.clear)
  const placeOrder = useOrderStore((state) => state.placeOrder)
  const [step, setStep] = useState<CheckoutStep>(1)
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [deliveryMethod, setDeliveryMethod] = useState<OrderDelivery['method']>('standard')
  const [paymentMethod, setPaymentMethod] = useState<OrderPayment['method']>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const cartTotals = getTotals()
  const priorityFee = deliveryMethod === 'priority' ? PRIORITY_DISPATCH_FEE : 0
  const totals = {
    ...cartTotals,
    priorityFee,
    total: Math.round((cartTotals.total + priorityFee + Number.EPSILON) * 100) / 100,
  }
  const shippableItems = items.filter(
    (item): item is Exclude<CartLineItem, { kind: 'digital' }> => item.kind !== 'digital',
  )
  const eta = shippableItems.length ? getCartEta(shippableItems) : null

  useEffect(() => () => {
    if (processingTimer.current !== null) window.clearTimeout(processingTimer.current)
  }, [])

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget
    setFields((current) => ({ ...current, [name]: value }))
    event.currentTarget.setCustomValidity('')
  }

  function continueToNextStep() {
    if (!formRef.current?.reportValidity()) return
    setStep((current) => Math.min(3, current + 1) as CheckoutStep)
  }

  function validatePayment(): boolean {
    if (paymentMethod !== 'card') return true

    const numberInput = formRef.current?.elements.namedItem('cardNumber')
    const expiryInput = formRef.current?.elements.namedItem('expiry')
    const cvvInput = formRef.current?.elements.namedItem('cvv')
    if (!(numberInput instanceof HTMLInputElement) || !(expiryInput instanceof HTMLInputElement) || !(cvvInput instanceof HTMLInputElement)) {
      return false
    }

    numberInput.setCustomValidity(isValidCardNumber(fields.cardNumber) ? '' : 'Enter a valid card number.')
    expiryInput.setCustomValidity(isValidCardExpiry(fields.expiry) ? '' : 'Enter an unexpired date in MM/YY format.')
    const expectedCvvLength = detectCardBrand(fields.cardNumber) === 'American Express' ? 4 : 3
    cvvInput.setCustomValidity(
      new RegExp(`^\\d{${expectedCvvLength}}$`).test(fields.cvv)
        ? ''
        : `Enter the ${expectedCvvLength}-digit security code.`,
    )
    return formRef.current?.reportValidity() ?? false
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (items.length === 0 || isProcessing || !validatePayment()) return

    setIsProcessing(true)
    processingTimer.current = window.setTimeout(() => {
      const customer: OrderCustomer = {
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
      }
      const address: OrderAddress = {
        line1: fields.line1,
        line2: fields.line2,
        city: fields.city,
        state: fields.state,
        postalCode: fields.postalCode,
        country: fields.country,
      }
      const payment: OrderPayment = paymentMethod === 'card'
        ? {
            method: 'card',
            last4: fields.cardNumber.replace(/\D/g, '').slice(-4),
            provider: detectCardBrand(fields.cardNumber),
          }
        : paymentMethod === 'upi'
          ? { method: 'upi', provider: fields.upiId }
          : { method: 'cash-on-delivery' }
      const delivery: OrderDelivery = { method: deliveryMethod, priorityFee }
      const order = placeOrder(customer, address, payment, items, totals, delivery)
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    }, 1500)
  }

  if (items.length === 0) {
    return (
      <Container className="checkout-empty">
        <p className="destination-page__eyebrow">NOTHING TO CHECK OUT</p>
        <h1>Your cart is waiting.</h1>
        <p>Add a PC or a few parts to continue to checkout.</p>
        <Link className="ui-button ui-button--primary" to="/cart">Return to cart <Icon name="arrow" /></Link>
      </Container>
    )
  }

  return (
    <div className="checkout-page">
      <Container>
        <div className="checkout-page__heading">
          <p className="destination-page__eyebrow">SECURE · SIMULATED CHECKOUT</p>
          <h1>Complete your order<span>.</span></h1>
          <p>Demo mode, no real payment is taken. Card details are never saved.</p>
        </div>
        <ol aria-label="Checkout progress" className="checkout-progress">
          {(['Contact & address', 'Delivery', 'Payment'] as const).map((label, index) => {
            const stepNumber = (index + 1) as CheckoutStep
            return (
              <li aria-current={step === stepNumber ? 'step' : undefined} className={step >= stepNumber ? 'is-complete' : ''} key={label}>
                <span>{step > stepNumber ? '✓' : stepNumber}</span>{label}
              </li>
            )
          })}
        </ol>
        <div aria-hidden="true" className="checkout-progress__track"><span style={{ width: `${((step - 1) / 2) * 100}%` }} /></div>

        <div className="checkout-layout">
          <form aria-busy={isProcessing} className="checkout-form" onSubmit={submitOrder} ref={formRef}>
            {step === 1 && (
              <section className="checkout-form__section">
                <div><p className="destination-page__eyebrow">01 · CONTACT + SHIPPING ADDRESS</p><h2>Where should we send your order?</h2></div>
                <div className="checkout-form__grid">
                  <label className="checkout-form__wide">Full name<input autoComplete="name" name="name" onChange={updateField} required value={fields.name} /></label>
                  <label>Email address<input autoComplete="email" name="email" onChange={updateField} required type="email" value={fields.email} /></label>
                  <label>Phone number<input autoComplete="tel" name="phone" onChange={updateField} required type="tel" value={fields.phone} /></label>
                  <label className="checkout-form__wide">Street address<input autoComplete="address-line1" name="line1" onChange={updateField} required value={fields.line1} /></label>
                  <label className="checkout-form__wide">Apartment, suite, etc. <span>Optional</span><input autoComplete="address-line2" name="line2" onChange={updateField} value={fields.line2} /></label>
                  <label>City<input autoComplete="address-level2" name="city" onChange={updateField} required value={fields.city} /></label>
                  <label>State / region<input autoComplete="address-level1" name="state" onChange={updateField} required value={fields.state} /></label>
                  <label>Postal code<input autoComplete="postal-code" name="postalCode" onChange={updateField} required value={fields.postalCode} /></label>
                  <label>Country<input autoComplete="country-name" name="country" onChange={updateField} required value={fields.country} /></label>
                </div>
              </section>
            )}

            {step === 2 && (
              <fieldset className="checkout-form__section checkout-delivery">
                <legend><span className="destination-page__eyebrow">02 · DELIVERY</span><strong>Choose how your order is dispatched</strong></legend>
                {eta ? (
                  <>
                    <label className="checkout-delivery__option">
                      <input checked={deliveryMethod === 'standard'} name="deliveryMethod" onChange={() => setDeliveryMethod('standard')} required type="radio" value="standard" />
                      <span><strong>Standard delivery <small>No extra charge</small></strong><DeliveryBadge eta={eta} /></span>
                    </label>
                    <label className="checkout-delivery__option">
                      <input checked={deliveryMethod === 'priority'} name="deliveryMethod" onChange={() => setDeliveryMethod('priority')} type="radio" value="priority" />
                      <span><strong>Priority dispatch <small>+{currencyFormatter.format(PRIORITY_DISPATCH_FEE)}</small></strong><span>Same estimated arrival date; your order is prioritised for dispatch.</span><DeliveryBadge eta={eta} /></span>
                    </label>
                    <p className="checkout-delivery__note">Priority changes dispatch order only; it does not change the delivery estimate.</p>
                  </>
                ) : (
                  <p className="checkout-delivery__note">Your cart contains only digital items. They are available immediately, and no shipping is required.</p>
                )}
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="checkout-form__section checkout-payment">
                <legend><span className="destination-page__eyebrow">03 · PAYMENT</span><strong>Choose a payment method</strong></legend>
                <p className="checkout-payment__demo">Demo mode, no real payment is taken. Enter only sample data; full card details are discarded after checkout.</p>
                <label className="checkout-payment__option">
                  <input checked={paymentMethod === 'card'} name="payment" onChange={() => setPaymentMethod('card')} type="radio" value="card" />
                  <span>Credit or debit card <small>Mock card · Luhn-checked</small></span>
                </label>
                {paymentMethod === 'card' && (
                  <div className="checkout-payment__fields">
                    <label className="checkout-payment__detail">Name on card<input autoComplete="cc-name" name="cardholderName" onChange={updateField} required value={fields.cardholderName} /></label>
                    <label className="checkout-payment__detail">Card number
                      <span className="checkout-card-number">
                        <input autoComplete="cc-number" inputMode="numeric" name="cardNumber" onChange={(event) => {
                          const input = event.currentTarget
                          setFields((current) => ({ ...current, cardNumber: formatCardNumber(input.value) }))
                          input.setCustomValidity('')
                        }} placeholder="4242 4242 4242 4242" required value={fields.cardNumber} />
                        <span aria-label={`${detectCardBrand(fields.cardNumber)} card detected`} className="checkout-card-brand" role="img">
                          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><rect height="16" rx="2" stroke="currentColor" strokeWidth="1.5" width="21" x="1.5" y="4" /><path d="M2 9h20M6 14h4" stroke="currentColor" strokeWidth="1.5" /></svg>
                          {detectCardBrand(fields.cardNumber)}
                        </span>
                      </span>
                    </label>
                    <label className="checkout-payment__detail">Expiry<input autoComplete="cc-exp" inputMode="numeric" maxLength={5} name="expiry" onChange={(event) => {
                      const input = event.currentTarget
                      setFields((current) => ({ ...current, expiry: formatCardExpiry(input.value) }))
                      input.setCustomValidity('')
                    }} pattern="(0[1-9]|1[0-2])/[0-9]{2}" placeholder="MM/YY" required value={fields.expiry} /></label>
                    <label className="checkout-payment__detail">Security code<input autoComplete="cc-csc" inputMode="numeric" maxLength={4} name="cvv" onChange={updateField} required type="password" value={fields.cvv} /></label>
                  </div>
                )}
                <label className="checkout-payment__option">
                  <input checked={paymentMethod === 'upi'} name="payment" onChange={() => setPaymentMethod('upi')} type="radio" value="upi" />
                  <span>UPI <small>Mock only · no payment request will be sent</small></span>
                </label>
                {paymentMethod === 'upi' && (
                  <label className="checkout-payment__detail">UPI ID<input autoComplete="off" name="upiId" onChange={updateField} placeholder="name@example" required value={fields.upiId} /></label>
                )}
                <label className="checkout-payment__option">
                  <input checked={paymentMethod === 'cash-on-delivery'} name="payment" onChange={() => setPaymentMethod('cash-on-delivery')} type="radio" value="cash-on-delivery" />
                  <span>Cash on delivery <small>Simulated payment choice</small></span>
                </label>
              </fieldset>
            )}

            <div className="checkout-form__navigation">
              {step > 1 && <button className="ui-button ui-button--outline" disabled={isProcessing} onClick={() => setStep((current) => (current - 1) as CheckoutStep)} type="button">Back</button>}
              {step < 3 ? (
                <button className="ui-button ui-button--primary" disabled={isProcessing} onClick={continueToNextStep} type="button">Continue <Icon name="arrow" /></button>
              ) : (
                <button className="ui-button ui-button--primary checkout-form__submit" disabled={isProcessing} type="submit">
                  {isProcessing ? <><span aria-hidden="true" className="checkout-spinner" /> Processing order…</> : <>Place Order <Icon name="arrow" /></>}
                </button>
              )}
            </div>
          </form>

          <aside aria-label="Order summary" className="checkout-summary">
            <p className="destination-page__eyebrow">YOUR ORDER</p>
            <h2>Order summary</h2>
            <ul>
              {items.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>Qty {item.quantity} · {item.kind === 'custom-build' ? `${item.parts.length} included parts` : item.kind === 'digital' ? 'Digital' : item.kind === 'prebuilt' ? 'Prebuilt PC' : item.category}</small>
                    {item.kind === 'digital' ? <small>Available immediately</small> : <DeliveryBadge eta={getItemEta(item)} />}
                  </span>
                  <b>{currencyFormatter.format(item.price * item.quantity)}</b>
                </li>
              ))}
            </ul>
            {eta && <div className="checkout-summary__arrival"><span>Estimated arrival</span><DeliveryBadge eta={eta} /></div>}
            <div className="checkout-summary__totals">
              <div><span>Subtotal</span><b>{currencyFormatter.format(totals.subtotal)}</b></div>
              {totals.discount > 0 && <div><span>Discount</span><b>−{currencyFormatter.format(totals.discount)}</b></div>}
              <div><span>Tax</span><b>{currencyFormatter.format(totals.tax)}</b></div>
              <div><span>Shipping</span><b>{totals.shipping ? currencyFormatter.format(totals.shipping) : 'Free'}</b></div>
              {priorityFee > 0 && <div><span>Priority dispatch</span><b>{currencyFormatter.format(priorityFee)}</b></div>}
              <div className="checkout-summary__total"><strong>Total</strong><strong>{currencyFormatter.format(totals.total)}</strong></div>
            </div>
            <p className="checkout-summary__note">No real payment is processed. Your simulated order will be saved in this browser.</p>
            <Link className="checkout-summary__back" to="/cart">Return to cart</Link>
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default Checkout
