import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { currencyFormatter } from '../config'
import { prebuilts } from '../data/prebuilts'
import { useCartStore } from '../store/cartStore'
import AddToCartButton from '../components/shop/AddToCartButton'
import LazyImage from '../components/ui/LazyImage'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import PrebuiltCard from '../components/shop/PrebuiltCard'
import Icon from '../components/layout/Icon'

type DetailTab = 'overview' | 'specs' | 'reviews' | 'shipping'

const reviews = [
  { name: 'Jordan M.', title: 'Excellent build quality', date: 'Verified owner', rating: 5, body: 'Everything arrived carefully packed and the setup was effortless. Cable management and attention to detail are excellent.' },
  { name: 'Priya K.', title: 'Exactly what I needed', date: 'Verified owner', rating: 5, body: 'Games run beautifully and the system stays quiet. The component choices feel balanced and well thought out.' },
  { name: 'Alex R.', title: 'A fantastic upgrade', date: 'Verified owner', rating: 4, body: 'The performance is brilliant, and support helped me get everything configured on day one.' },
]

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'shipping', label: 'Shipping & Warranty' },
]

function PrebuiltDetail() {
  const { id } = useParams()
  const prebuilt = prebuilts.find((item) => item.id === id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const addToCart = useCartStore((state) => state.add)
  const navigate = useNavigate()

  if (!prebuilt) {
    return (
      <Container className="prebuilt-missing">
        <p className="destination-page__eyebrow">BUILD NOT FOUND</p>
        <h1>That PC is off the grid.</h1>
        <Link className="ui-button ui-button--primary" to="/prebuilts">Explore all builds</Link>
      </Container>
    )
  }

  const product = { ...prebuilt, kind: 'prebuilt' as const }

  function buyNow() {
    addToCart(product, quantity)
    navigate('/checkout', { state: { buyNow: product.id } })
  }

  function customizeThisBuild() {
    navigate('/customize', {
      state: {
        preloadedBuild: {
          id: product.id,
          name: product.name,
          price: product.price,
          parts: Object.entries(product.specs).map(([category, name]) => ({ category, name })),
        },
      },
    })
  }

  return (
    <div className="prebuilt-detail">
      <Container>
        <nav aria-label="Breadcrumb" className="prebuilt-breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/prebuilts">Prebuilt PCs</Link><span aria-hidden="true">/</span><span aria-current="page">{prebuilt.name}</span>
        </nav>

        <div className="prebuilt-detail__top">
          <section aria-label={`${prebuilt.name} images`} className="prebuilt-gallery">
            <div className="prebuilt-gallery__main">
              <LazyImage alt={`${prebuilt.name} PC, view ${selectedImage + 1}`} data-image-reveal height="1000" loading="eager" src={prebuilt.images[selectedImage] ?? prebuilt.images[0]} width="1200" />
              <span className="prebuilt-gallery__label">{prebuilt.colorTheme}</span>
              <span aria-hidden="true" className="prebuilt-gallery__index">{String(selectedImage + 1).padStart(2, '0')} / {String(prebuilt.images.length).padStart(2, '0')}</span>
            </div>
            {prebuilt.images.length > 1 && (
              <div aria-label="Choose a product image" className="prebuilt-gallery__thumbnails">
                {prebuilt.images.map((image, index) => (
                  <button
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={selectedImage === index ? 'is-selected' : ''}
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    type="button"
                  >
                    <LazyImage alt="" height="150" loading="lazy" src={image} width="190" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="prebuilt-name" className="prebuilt-purchase">
            <p className="destination-page__eyebrow">{prebuilt.category} · HAND-BUILT AND TESTED</p>
            <h1 id="prebuilt-name">{prebuilt.name}</h1>
            <p className="prebuilt-purchase__tagline">{prebuilt.tagline}</p>
            <div className="prebuilt-purchase__rating">
              <span aria-hidden="true">★★★★★</span>
              <strong>{prebuilt.rating.toFixed(1)}</strong>
              <a href="#prebuilt-reviews">({reviews.length} reviews)</a>
            </div>
            <p className="prebuilt-purchase__price">{currencyFormatter.format(prebuilt.price)}</p>
            <DeliveryBadge item={prebuilt} />
            <p className="prebuilt-purchase__stock">
              <span aria-hidden="true" className={`stock-indicator stock-indicator--${prebuilt.stockStatus}`} />
              {prebuilt.stockStatus === 'in-stock' ? 'In stock and ready to ship' : prebuilt.stockStatus === 'low-stock' ? 'Low stock — ready to ship soon' : 'Built to order'}
            </p>
            <div className="prebuilt-purchase__highlights">
              {prebuilt.badges.map((badge) => <span className="ui-badge" key={badge}>{badge}</span>)}
            </div>
            <div className="prebuilt-purchase__quantity">
              <span>Quantity</span>
              <div className="quantity-stepper">
                <button aria-label={`Decrease ${prebuilt.name} quantity`} disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">−</button>
                <span aria-live="polite">{quantity}</span>
                <button aria-label={`Increase ${prebuilt.name} quantity`} disabled={quantity >= 10} onClick={() => setQuantity((value) => Math.min(10, value + 1))} type="button">+</button>
              </div>
            </div>
            <div className="prebuilt-purchase__actions">
              <AddToCartButton arrow className="ui-button ui-button--primary" item={product} quantity={quantity} />
              <button className="ui-button ui-button--outline" onClick={buyNow} type="button">Buy Now</button>
              <button className="prebuilt-purchase__customize" onClick={customizeThisBuild} type="button">
                Customize This Build <Icon name="arrow" />
              </button>
            </div>
            <p className="prebuilt-purchase__assurance">Secure checkout · Professionally assembled · Quality tested</p>
          </section>
        </div>

        <section aria-label="Build details" className="prebuilt-information">
          <div aria-label="Prebuilt details" className="prebuilt-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                aria-controls={`prebuilt-panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                id={`prebuilt-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}{tab.id === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>
          <div
            aria-labelledby={`prebuilt-tab-${activeTab}`}
            className="prebuilt-tab-panel"
            id={`prebuilt-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            {activeTab === 'overview' && (
              <div className="prebuilt-overview">
                <div>
                  <p className="destination-page__eyebrow">READY WHEN YOU ARE</p>
                  <h2>{prebuilt.name}, in its element.</h2>
                  <p>{prebuilt.tagline} Every system is assembled by hand, configured, and checked by our build team before it heads your way.</p>
                  <p>From the first boot to your next all-night session, the parts are chosen to work together and leave room for what comes next.</p>
                </div>
                <div aria-label="Build highlights" className="prebuilt-overview__stats">
                  <span><strong>{prebuilt.fps['1080p']}</strong><small>EST. FPS · 1080P</small></span>
                  <span><strong>{prebuilt.fps['1440p']}</strong><small>EST. FPS · 1440P</small></span>
                  <span><strong>{prebuilt.specs.RAM.split(' ')[0]}</strong><small>MEMORY</small></span>
                </div>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="prebuilt-specification">
                <section aria-labelledby="specifications-heading">
                  <h2 id="specifications-heading">Full specifications</h2>
                  <dl className="prebuilt-spec-table">
                    {Object.entries(prebuilt.specs).map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                </section>
                <section aria-labelledby="fps-heading">
                  <h2 id="fps-heading">Estimated gaming performance</h2>
                  <p>Approximate average frame rates; results vary by game and settings.</p>
                  <table className="prebuilt-fps-table">
                    <thead><tr><th scope="col">Resolution</th><th scope="col">Estimated FPS</th><th scope="col">Experience</th></tr></thead>
                    <tbody>
                      <tr><th scope="row">1080p</th><td>{prebuilt.fps['1080p']} FPS</td><td>High refresh rate</td></tr>
                      <tr><th scope="row">1440p</th><td>{prebuilt.fps['1440p']} FPS</td><td>Detailed and responsive</td></tr>
                    </tbody>
                  </table>
                </section>
              </div>
            )}
            {activeTab === 'reviews' && (
              <section aria-labelledby="prebuilt-reviews" className="prebuilt-reviews">
                <div className="prebuilt-reviews__summary">
                  <strong>{prebuilt.rating.toFixed(1)}</strong><span>★★★★★</span><small>Based on {reviews.length} verified owner reviews</small>
                </div>
                <div>
                  <h2 id="prebuilt-reviews">Reviews for {prebuilt.name}</h2>
                  {reviews.map((review) => (
                    <article className="prebuilt-review" key={review.name}>
                      <div><strong>{review.title}</strong><span aria-label={`${review.rating} out of 5 stars`}>★★★★★</span></div>
                      <p>{review.body}</p>
                      <small>{review.name} · {review.date}</small>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {activeTab === 'shipping' && (
              <section className="prebuilt-shipping">
                <div>
                  <p className="destination-page__eyebrow">DELIVERY</p>
                  <h2>Built with care. On its way soon.</h2>
                  <DeliveryBadge item={prebuilt} />
                  <p>In-stock systems ship in 4 days. Low-stock or made-to-order builds typically ship in 6 days. Every order includes tracking once dispatched.</p>
                </div>
                <div>
                  <p className="destination-page__eyebrow">WARRANTY</p>
                  <h2>Here when you need us.</h2>
                  <p>Your PC includes a 2-year limited parts and labor warranty, plus lifetime technical support from our build team.</p>
                  <Link to="/support/warranty-returns">Warranty & returns <Icon name="arrow" /></Link>
                </div>
              </section>
            )}
          </div>
        </section>

        <section aria-labelledby="you-may-like-heading" className="prebuilt-recommendations">
          <div className="prebuilt-recommendations__heading">
            <div><p className="destination-page__eyebrow">MORE TO EXPLORE</p><h2 id="you-may-like-heading">You may also like.</h2></div>
            <Link to="/prebuilts">View all builds <Icon name="arrow" /></Link>
          </div>
          <div className="prebuilt-grid prebuilt-grid--recommendations">
            {prebuilts.filter((item) => item.id !== prebuilt.id).slice(0, 3).map((item, index) => (
              <PrebuiltCard index={index} key={item.id} prebuilt={item} />
            ))}
          </div>
        </section>
      </Container>

      <div aria-label={`${prebuilt.name} purchase options`} className="prebuilt-mobile-buy-bar">
        <div><small>{prebuilt.name}</small><strong>{currencyFormatter.format(prebuilt.price * quantity)}</strong></div>
        <AddToCartButton arrow className="ui-button ui-button--primary" item={product} quantity={quantity} />
        <button className="ui-button ui-button--outline" onClick={buyNow} type="button">Buy Now</button>
      </div>
    </div>
  )
}

export default PrebuiltDetail
