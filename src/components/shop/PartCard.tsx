import { Link } from 'react-router-dom'
import { currencyFormatter } from '../../config'
import type { Part } from '../../data/parts'
import { getPartFacet, getPartPrice } from '../../lib/partsCatalog'
import DeliveryBadge from '../ui/DeliveryBadge'
import AddToCartButton from './AddToCartButton'
import LazyImage from '../ui/LazyImage'

interface PartCardProps {
  part: Part
  compareSelected: boolean
  compareDisabled: boolean
  onToggleCompare: () => void
}

function PartCard({
  part,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: PartCardProps) {
  const facet = getPartFacet(part)
  const price = getPartPrice(part)
  const keySpecs = Object.entries(part.specs).slice(0, 3)

  return (
    <article className="part-card">
      <Link aria-label={`View ${part.brand} ${part.name}`} className="part-card__image" to={`/parts/${part.id}`}>
        <LazyImage alt="" data-image-reveal height="720" loading="lazy" src={part.image} width="900" />
        {part.outlet && <span className="part-card__outlet">OUTLET</span>}
      </Link>
      <div className="part-card__body">
        <div className="part-card__heading">
          <div>
            <p className="part-card__brand">{part.brand} · {part.category}</p>
            <h2><Link to={`/parts/${part.id}`}>{part.name}</Link></h2>
          </div>
          <span aria-label={`${part.rating} out of 5 stars`} className="part-card__rating">★ {part.rating.toFixed(1)}</span>
        </div>
        <dl aria-label={`${part.name} key specifications`} className="part-card__specs">
          {keySpecs.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>
          ))}
          {facet && !keySpecs.some(([key]) => key.toLowerCase() === facet.label.toLowerCase()) && (
            <div><dt>{facet.label}</dt><dd>{facet.value}</dd></div>
          )}
        </dl>
        <div className="part-card__delivery">
          <span className={`part-stock part-stock--${part.stock}`}>
            <span aria-hidden="true" />
            {part.stock === 'in-stock' ? 'In stock' : part.stock === 'low-stock' ? 'Low stock' : 'Made to order'}
          </span>
          <DeliveryBadge item={part} />
        </div>
        <div className="part-card__purchase">
          <strong>{currencyFormatter.format(price)}</strong>
          {part.outlet && part.discountedPrice !== undefined && (
            <del>{currencyFormatter.format(part.price)}</del>
          )}
        </div>
        <div className="part-card__actions">
          <button
            aria-pressed={compareSelected}
            className="part-card__compare"
            disabled={compareDisabled}
            onClick={onToggleCompare}
            type="button"
          >
            {compareSelected ? 'Selected to compare' : 'Compare'}
          </button>
          <AddToCartButton
            className="ui-button ui-button--primary"
            item={{ ...part, kind: 'part' }}
          />
        </div>
      </div>
    </article>
  )
}

export default PartCard
