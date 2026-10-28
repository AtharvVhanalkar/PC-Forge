import { Link } from 'react-router-dom'
import Icon from '../layout/Icon'

const components = [
  { number: '01', part: 'CPU', name: 'Core for your next big idea', side: 'left' },
  { number: '02', part: 'GPU', name: 'Frames that keep up', side: 'right' },
  { number: '03', part: 'RAM', name: 'Headroom to do more', side: 'left' },
  { number: '04', part: 'COOLING', name: 'Cool under pressure', side: 'right' },
]

function BuildShowcase() {
  return (
    <section
      aria-labelledby="build-showcase-heading"
      className="build-showcase"
      data-pinned-build
    >
      <div className="build-showcase__inner container">
        <div className="build-showcase__intro">
          <p className="home-section-heading__eyebrow">YOUR BUILD. YOUR RULES.</p>
          <h2 id="build-showcase-heading">Make it<br />personal.</h2>
          <p>Pick every part. See how it all fits. We’ll take care of the rest.</p>
          <Link className="ui-button ui-button--primary" to="/customize">
            Start Your Build <Icon name="arrow" />
          </Link>
        </div>
        <div className="build-showcase__stage">
          <div aria-hidden="true" className="build-showcase__orbit build-showcase__orbit--one" />
          <div aria-hidden="true" className="build-showcase__orbit build-showcase__orbit--two" />
          <div aria-hidden="true" className="build-pc-model">
            <div className="build-pc-model__case">
              <span className="build-pc-model__glass" />
              <span className="build-pc-model__board" />
              <span className="build-pc-model__gpu"><i /><i /><i /></span>
              <span className="build-pc-model__ram"><i /><i /></span>
              <span className="build-pc-model__cooler"><i /><i /><i /></span>
              <span className="build-pc-model__cable" />
              <span className="build-pc-model__base" />
            </div>
          </div>
          <div className="build-showcase__callouts">
            {components.map((item) => (
              <div
                className={`build-callout build-callout--${item.side}`}
                data-build-callout
                key={item.part}
              >
                <span className="build-callout__number">{item.number}</span>
                <span className="build-callout__copy">
                  <strong>{item.part}</strong>
                  <span>{item.name}</span>
                </span>
                <span aria-hidden="true" className="build-callout__line" />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="build-showcase__caption">
            <span>01</span> YOUR BUILD, COMPONENT BY COMPONENT
          </div>
        </div>
      </div>
      <span aria-hidden="true" className="build-showcase__background-number">PC</span>
    </section>
  )
}

export default BuildShowcase
