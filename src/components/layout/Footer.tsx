import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../../config'
import { buildHelpLinks, shopLinks, supportLinks } from './navigation'

const currentYear = new Date().getFullYear()

function Footer() {
  const [subscribed, setSubscribed] = useState(false)

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link aria-label={`${config.brandName} home`} className="site-logo" to="/">
            <span className="site-logo__mark" aria-hidden="true">P</span><span>{config.brandName}</span>
          </Link>
          <p>Precision-built PCs and parts for whatever comes next.</p>
          <div aria-label="Social media" className="site-footer__socials">
            <a aria-label="Instagram" href="https://www.instagram.com/" rel="noreferrer" target="_blank">IG</a>
            <a aria-label="YouTube" href="https://www.youtube.com/" rel="noreferrer" target="_blank">YT</a>
            <a aria-label="X" href="https://x.com/" rel="noreferrer" target="_blank">X</a>
          </div>
        </div>
        <FooterLinkGroup links={shopLinks} title="Shop" />
        <FooterLinkGroup links={buildHelpLinks} title="Build Help" />
        <FooterLinkGroup links={supportLinks} title="Support" />
        <div className="site-footer__newsletter">
          <h2>Get the good stuff.</h2>
          <p>New drops, build inspiration, and offers. No noise.</p>
          <form onSubmit={submitNewsletter}>
            <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
            <input autoComplete="email" id="newsletter-email" name="email" placeholder="you@example.com" required type="email" />
            <button aria-label="Subscribe to newsletter" type="submit">Join <span aria-hidden="true">→</span></button>
          </form>
          <p aria-live="polite" className="site-footer__newsletter-status">
            {subscribed ? 'You’re on the list. Thanks for joining.' : 'By subscribing, you agree to receive PCForge updates.'}
          </p>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p>© {currentYear} {config.brandName}. Built for your next level.</p>
        <div aria-label="Accepted payment methods" className="site-footer__payments">
          <span>VISA</span><span>MC</span><span>AMEX</span><span>PayPal</span>
        </div>
        <div className="site-footer__policies">
          <Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}

function FooterLinkGroup({
  links,
  title,
}: {
  links: { label: string; to: string }[]
  title: string
}) {
  return (
    <nav aria-label={`${title} links`} className="site-footer__links">
      <h2>{title}</h2>
      {links.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
    </nav>
  )
}

export default Footer
