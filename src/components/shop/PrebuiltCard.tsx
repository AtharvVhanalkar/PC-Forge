import { motion, useReducedMotion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { currencyFormatter } from '../../config'
import type { Prebuilt } from '../../data/prebuilts'
import { useCartStore } from '../../store/cartStore'
import DeliveryBadge from '../ui/DeliveryBadge'
import AddToCartButton from './AddToCartButton'
import LazyImage from '../ui/LazyImage'

interface PrebuiltCardProps {
  prebuilt: Prebuilt
  index?: number
}

function PrebuiltCard({ prebuilt, index = 0 }: PrebuiltCardProps) {
  const addToCart = useCartStore((state) => state.add)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const product = { ...prebuilt, kind: 'prebuilt' as const }

  function buyNow() {
    addToCart(product)
    navigate('/checkout', { state: { buyNow: prebuilt.id } })
  }

  return (
    <motion.article
      className="prebuilt-card"
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      layout={reducedMotion ? false : true}
      transition={{ layout: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] } }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: 12 }}
    >
      <Link aria-label={`View ${prebuilt.name}`} className="prebuilt-card__image" to={`/prebuilts/${prebuilt.id}`}>
        <LazyImage alt={`${prebuilt.name} gaming PC`} data-image-reveal height="700" loading={index < 3 ? 'eager' : 'lazy'} src={prebuilt.images[0]} width="900" />
        <span className="prebuilt-card__number">{String(index + 1).padStart(2, '0')} / 08</span>
        <span className="prebuilt-card__category">{prebuilt.category}</span>
        {prebuilt.badges[0] && <span className="prebuilt-card__badge">{prebuilt.badges[0]}</span>}
      </Link>
      <div className="prebuilt-card__body">
        <div className="prebuilt-card__title-row">
          <div>
            <p className="prebuilt-card__eyebrow">{prebuilt.category} · {prebuilt.colorTheme}</p>
            <h2><Link to={`/prebuilts/${prebuilt.id}`}>{prebuilt.name}</Link></h2>
          </div>
          <div className="prebuilt-card__rating" aria-label={`${prebuilt.rating} out of 5 stars`}>
            <span aria-hidden="true">★</span> {prebuilt.rating.toFixed(1)}
          </div>
        </div>
        <p className="prebuilt-card__tagline">{prebuilt.tagline}</p>
        <div className="prebuilt-card__specs">
          <span><small>CPU</small>{prebuilt.specs.CPU.split(' ').slice(0, 3).join(' ')}</span>
          <span><small>GPU</small>{prebuilt.specs.GPU.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}</span>
          <span><small>MEMORY</small>{prebuilt.specs.RAM}</span>
        </div>
        <div className="prebuilt-card__delivery"><DeliveryBadge item={prebuilt} /></div>
        <div className="prebuilt-card__purchase">
          <strong>{currencyFormatter.format(prebuilt.price)}</strong>
          <div className="prebuilt-card__actions">
            <AddToCartButton
              aria-label={`Add ${prebuilt.name} to cart`}
              className="prebuilt-card__add"
              item={product}
              arrow
            />
            <button
              aria-label={`Buy ${prebuilt.name} now`}
              className="prebuilt-card__buy"
              onClick={buyNow}
              type="button"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default PrebuiltCard
