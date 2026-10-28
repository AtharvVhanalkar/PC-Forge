import { useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'

function Legal() {
  const { pathname } = useLocation()
  const isPrivacy = pathname === '/privacy'
  return (
    <Container className="account-page legal-page">
      <header className="destination-page__header"><p className="destination-page__eyebrow">PCFORGE · DEMO INFORMATION</p><h1>{isPrivacy ? 'Privacy notice' : 'Terms of use'}<span>.</span></h1><p>This prototype is for demonstration only. No real commerce, account security, or customer-support service is provided.</p></header>
      {isPrivacy ? (
        <section className="legal-copy"><h2>Local browser data</h2><p>Demo cart items, orders, sell requests, and profile information are saved in this browser’s local storage. This data is not synchronized to a server and may be cleared by your browser.</p><h2>Mock payment details</h2><p>Do not enter real payment card details. Checkout is simulated and stores only the payment method and, for cards, the last four digits.</p><h2>Contact forms</h2><p>The support form displays a demo confirmation. It does not send your message to a support team.</p></section>
      ) : (
        <section className="legal-copy"><h2>Demo-only use</h2><p>All product inventory, prices, offers, availability, warranties, shipping dates, and order states are mock data and are not an offer to sell.</p><h2>No real transactions</h2><p>Placing an order, registering an account, submitting a support message, or creating a sell request does not create a real transaction or service obligation.</p><h2>Verify before purchasing</h2><p>For a real purchase, confirm current product specifications, compatibility, price, shipping, warranty, and return terms with the retailer.</p></section>
      )}
    </Container>
  )
}

export default Legal
