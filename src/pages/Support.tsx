import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Toast, { type ToastVariant } from '../components/ui/Toast'
import Icon from '../components/layout/Icon'

const faqEntries = [
  { question: 'How long does delivery take?', answer: 'Delivery estimates use three tiers and skip Sundays: 4 days for in-stock single parts, accessories, and in-stock prebuilts; 6 days for low-stock parts, large items such as cases and monitors, and standard made-to-order items; and 10 days for fully custom configured PCs after assembly, stress testing, and QA. Mixed carts use the longest item ETA, and no order estimate exceeds 10 days.' },
  { question: 'Does priority dispatch change my arrival estimate?', answer: 'No. Priority dispatch adds a mock fee and prioritises dispatch, but keeps the same 4-, 6-, or 10-day delivery tier shown for your order.' },
  { question: 'Are checkout payments real?', answer: 'No. PCForge is a frontend demo. Card, UPI, and cash-on-delivery choices are simulations; no payment is requested or processed.' },
  { question: 'Where are my orders and sell requests saved?', answer: 'Orders, sell requests, and demo account details are stored in this browser only. They are not sent to a server and may not appear in another browser or device.' },
  { question: 'Can I change or cancel an order?', answer: 'This prototype does not submit real orders or provide a cancellation service. Use the order details page to review the saved demo information.' },
  { question: 'How do I check whether parts fit together?', answer: 'Use the interactive Compatibility Guide or start a custom PC build. The guide checks CPU socket, RAM generation, graphics-card clearance, and estimated PSU headroom using the mock catalog data.' },
]

function Support() {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    setToast({ message: 'Your demo support message has been recorded locally for this session.', variant: 'success' })
  }

  return (
    <Container className="account-page support-page">
      <header className="destination-page__header"><p className="destination-page__eyebrow">HERE WHEN YOU NEED US</p><h1>Customer support<span>.</span></h1><p>Questions about parts, build fit, or your simulated order? Send a mock message or explore the help pages.</p></header>
      <div className="support-layout">
        <form className="support-form" onSubmit={submitMessage}>
          <p className="destination-page__eyebrow">SEND A MESSAGE</p>
          <h2>How can we help?</h2>
          <label>Your name<input autoComplete="name" name="name" required /></label>
          <label>Email address<input autoComplete="email" name="email" required type="email" /></label>
          <label>Topic<select defaultValue="" name="topic" required><option disabled value="">Choose a topic</option><option>Product question</option><option>Build compatibility</option><option>Order tracking</option><option>Returns and warranty</option><option>Other</option></select></label>
          <label>Message<textarea maxLength={1200} minLength={10} name="message" required rows={5} /></label>
          <button className="ui-button ui-button--primary" type="submit">Send demo message <Icon name="arrow" /></button>
          <small>This form is a frontend demo; the message is not sent to a support team.</small>
        </form>
        <aside className="support-links">
          <Link to="/faq"><span>01</span><strong>FAQ & shipping</strong><p>Answers about delivery estimates and the mock store.</p><Icon name="arrow" /></Link>
          <Link to="/warranty"><span>02</span><strong>Warranty & returns</strong><p>Review the demo warranty and returns information.</p><Icon name="arrow" /></Link>
          <Link to="/track-order"><span>03</span><strong>Track an order</strong><p>Look up an order saved in this browser.</p><Icon name="arrow" /></Link>
        </aside>
      </div>
      {toast && <Toast message={toast.message} onDismiss={() => setToast(null)} variant={toast.variant} />}
    </Container>
  )
}

function FAQ() {
  return (
    <Container className="account-page faq-page">
      <header className="destination-page__header"><p className="destination-page__eyebrow">QUICK ANSWERS</p><h1>FAQ<span>.</span></h1><p>Shipping, store, and build questions for the PCForge demo.</p></header>
      <section aria-label="Frequently asked questions" className="faq-list">
        {faqEntries.map((entry, index) => <details key={entry.question}><summary><span>{String(index + 1).padStart(2, '0')}</span>{entry.question}<b aria-hidden="true">+</b></summary><p>{entry.answer}</p></details>)}
      </section>
      <p className="help-page__fineprint">Delivery times are estimated business-day tiers; Sundays are skipped.</p>
      <Link className="ui-button ui-button--outline" to="/support">Contact support <Icon name="arrow" /></Link>
    </Container>
  )
}

function Warranty() {
  return (
    <Container className="account-page warranty-page">
      <header className="destination-page__header"><p className="destination-page__eyebrow">CLEAR TERMS · MOCK STORE</p><h1>Warranty & returns<span>.</span></h1><p>This page describes sample policy content for the frontend prototype only.</p></header>
      <div className="warranty-grid">
        <section><span>01</span><h2>Prebuilt PCs</h2><p>Mock policy: assembled systems include a sample 2-year limited hardware warranty covering component defects under normal use.</p></section>
        <section><span>02</span><h2>Individual parts</h2><p>Mock policy: individual component coverage follows a sample 1-year store warranty; manufacturer coverage may vary by product.</p></section>
        <section><span>03</span><h2>Returns</h2><p>Mock policy: unused products may be requested for return within 30 days of delivery, subject to original packaging and inspection.</p></section>
        <section><span>04</span><h2>Custom builds</h2><p>Mock policy: custom configured PCs are assembled to order; contact the demo support form for fit or workmanship questions.</p></section>
      </div>
      <p className="help-page__fineprint">No actual warranty, return, repair, or refund is created by this demo. Review a real retailer’s terms before purchasing.</p>
      <Link className="ui-button ui-button--outline" to="/support">Ask a question <Icon name="arrow" /></Link>
    </Container>
  )
}

export { FAQ, Warranty }
export default Support
