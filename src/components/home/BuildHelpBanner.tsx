import { Link } from 'react-router-dom'
import Icon from '../layout/Icon'
import LazyImage from '../ui/LazyImage'

function BuildHelpBanner() {
  return (
    <section aria-labelledby="build-help-heading" className="build-help-banner home-section container home-reveal">
      <div className="build-help-banner__image">
        <LazyImage
          alt="A carefully arranged PC building workspace"
          height="720"
          loading="lazy"
          data-image-reveal
          src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80"
          width="900"
        />
        <span aria-hidden="true">THE BUILD STARTS HERE</span>
      </div>
      <div className="build-help-banner__copy">
        <p className="home-section-heading__eyebrow">KNOW BEFORE YOU BUILD</p>
        <h2 id="build-help-heading">Prefer to<br />build instead?</h2>
        <p>Get clear, no-nonsense advice on compatibility, component picks, power, and putting it all together.</p>
        <Link className="ui-button ui-button--primary" to="/build-help">
          Visit Build Help <Icon name="arrow" />
        </Link>
      </div>
    </section>
  )
}

export default BuildHelpBanner
