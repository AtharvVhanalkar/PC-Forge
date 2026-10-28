import { Link } from 'react-router-dom'
import Icon from '../layout/Icon'

const steps = ['Describe', 'Get a quote', 'Ship it']

function SellPartsStrip() {
  return (
    <section aria-labelledby="sell-parts-heading" className="sell-parts-strip home-reveal">
      <div className="sell-parts-strip__inner container">
        <div className="sell-parts-strip__intro">
          <p className="home-section-heading__eyebrow">GIVE GOOD GEAR A SECOND LIFE</p>
          <h2 id="sell-parts-heading">Your old parts<br />still have a next.</h2>
          <Link className="ui-button ui-button--outline" to="/sell-parts">
            Sell Your Parts <Icon name="arrow" />
          </Link>
        </div>
        <ol className="sell-parts-steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="sell-parts-strip__arrow"><Icon name="arrow" /></span>
      </div>
    </section>
  )
}

export default SellPartsStrip
