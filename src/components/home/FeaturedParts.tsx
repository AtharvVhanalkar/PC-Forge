import { useRef, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { currencyFormatter } from '../../config'
import { parts } from '../../data/parts'
import DeliveryBadge from '../ui/DeliveryBadge'
import Icon from '../layout/Icon'
import AddToCartButton from '../shop/AddToCartButton'
import LazyImage from '../ui/LazyImage'

const featuredPartIds = [
  'gpu-rtx-5080',
  'cpu-ryzen-7-9800x3d',
  'ram-vengeance-64-ddr5',
  'ssd-990pro-2tb',
  'cooler-kraken-360',
  'monitor-lg-27gr83q',
]

const featuredParts = featuredPartIds.map((id) => {
  const part = parts.find((item) => item.id === id)
  if (!part) throw new Error(`Missing featured homepage part: ${id}`)
  return part
})

function FeaturedParts() {
  const pointerStart = useRef<{ pointerId: number; x: number; scrollLeft: number; moved: boolean } | null>(null)

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    pointerStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const distance = event.clientX - start.x
    if (Math.abs(distance) > 5) {
      start.moved = true
      event.currentTarget.classList.add('is-dragging')
      event.preventDefault()
    }
    if (start.moved) event.currentTarget.scrollLeft = start.scrollLeft - distance
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerStart.current
    if (pointer?.pointerId !== event.pointerId) return
    event.currentTarget.classList.remove('is-dragging')
    window.setTimeout(() => {
      if (pointerStart.current === pointer) pointerStart.current = null
    }, 0)
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    const pointer = pointerStart.current
    if (!pointer?.moved) {
      pointerStart.current = null
      return
    }
    event.preventDefault()
    event.stopPropagation()
    pointerStart.current = null
  }

  return (
    <section aria-labelledby="featured-parts-heading" className="featured-parts home-section">
      <div className="container">
        <div className="featured-parts__heading home-reveal">
          <div className="home-section-heading">
            <p className="home-section-heading__eyebrow">CHOSEN BY OUR BUILDERS</p>
            <h2 id="featured-parts-heading">Parts worth the upgrade.</h2>
          </div>
          <Link className="featured-parts__all" to="/parts">Shop all parts <Icon name="arrow" /></Link>
        </div>
        <div
          aria-label="Featured PC parts"
          className="featured-parts__track"
          onClickCapture={handleClickCapture}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="region"
          tabIndex={0}
        >
          {featuredParts.map((part) => {
            const price = part.outlet && part.discountedPrice !== undefined ? part.discountedPrice : part.price

            return (
              <article className="featured-part-card" key={part.id}>
                <Link aria-label={`View ${part.name}`} className="featured-part-card__image" to={`/parts/${part.category.toLowerCase()}/${part.id}`}>
                  <LazyImage alt="" data-image-reveal height="360" loading="lazy" src={part.image} width="480" />
                  <span>{part.category}</span>
                  {part.outlet && <span className="featured-part-card__sale">OUTLET</span>}
                </Link>
                <div className="featured-part-card__body">
                  <p>{part.brand}</p>
                  <h3><Link to={`/parts/${part.category.toLowerCase()}/${part.id}`}>{part.name}</Link></h3>
                  <div className="featured-part-card__price">
                    <strong>{currencyFormatter.format(price)}</strong>
                    {part.outlet && part.discountedPrice !== undefined && (
                      <del>{currencyFormatter.format(part.price)}</del>
                    )}
                  </div>
                  <DeliveryBadge item={part} />
                  <AddToCartButton
                    className="featured-part-card__add"
                    item={{ ...part, kind: 'part' }}
                    label="Add to cart"
                    arrow
                  />
                </div>
              </article>
            )
          })}
        </div>
        <p className="featured-parts__hint"><span aria-hidden="true">←</span> DRAG OR SCROLL TO EXPLORE <span aria-hidden="true">→</span></p>
      </div>
    </section>
  )
}

export default FeaturedParts
