import { Link } from 'react-router-dom'
import Icon from '../layout/Icon'
import LazyImage from '../ui/LazyImage'

function StatementBanner() {
  return (
    <section aria-labelledby="home-banner-heading" className="statement-banner home-reveal">
      <LazyImage
        alt=""
        className="statement-banner__image"
        data-image-reveal
        data-home-parallax
        height="900"
        loading="lazy"
        src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1600&q=80"
        width="1920"
      />
      <div aria-hidden="true" className="statement-banner__overlay" />
      <div className="statement-banner__content container">
        <p className="home-section-heading__eyebrow">CLEAN LINES. SERIOUS POWER.</p>
        <h2 id="home-banner-heading">Aesthetics meet<br /><span>affordability.</span></h2>
        <p>Thoughtful design, perfectly balanced performance, and a build that feels like yours.</p>
        <Link className="ui-button ui-button--primary" to="/prebuilts/frost-nova">
          Shop Frost Nova <Icon name="arrow" />
        </Link>
      </div>
      <span aria-hidden="true" className="statement-banner__caption">01 / THE FROST NOVA</span>
    </section>
  )
}

export default StatementBanner
