import { Link, useNavigate, useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'
import { parts, type Part } from '../data/parts'
import { isCaseFitsGpu, isCpuMotherboardCompatible, isRamCompatible } from '../data/compatibility'
import { getPartPrice } from '../lib/partsCatalog'
import { useCartStore } from '../store/cartStore'
import AddToCartButton from '../components/shop/AddToCartButton'
import LazyImage from '../components/ui/LazyImage'
import { useCompareStore } from '../store/compareStore'

function getCompatibilityNotes(part: Part): string[] {
  if (part.category === 'CPU') {
    const compatibleBoards = parts.filter((candidate) =>
      isCpuMotherboardCompatible(part, candidate),
    )
    return [
      `Uses the ${part.compatibility.cpuSocket ?? 'listed'} socket.`,
      `${compatibleBoards.length} listed motherboards match this CPU socket.`,
      'Check motherboard firmware support for the specific processor before ordering.',
    ]
  }

  if (part.category === 'GPU') {
    const fittingCases = parts.filter((candidate) => isCaseFitsGpu(candidate, part))
    return [
      `Graphics card length: ${part.compatibility.gpuLengthMm ?? 'Not listed'} mm.`,
      `${fittingCases.length} listed cases provide enough GPU clearance.`,
      'Confirm case clearance and power supply requirements for your complete build.',
    ]
  }

  if (part.category === 'Motherboard') {
    const compatibleCpus = parts.filter((candidate) =>
      isCpuMotherboardCompatible(candidate, part),
    )
    const compatibleRam = parts.filter((candidate) => isRamCompatible(candidate, part))
    return [
      `CPU socket: ${part.compatibility.cpuSocket ?? 'Not listed'} · Memory: ${part.compatibility.ramType ?? 'Not listed'}.`,
      `${compatibleCpus.length} listed CPUs and ${compatibleRam.length} listed memory kits match these interfaces.`,
      'Check case form-factor clearance and board-specific firmware support.',
    ]
  }

  if (part.category === 'RAM') {
    const compatibleBoards = parts.filter((candidate) => isRamCompatible(part, candidate))
    return [
      `Memory type: ${part.compatibility.ramType ?? 'Not listed'}.`,
      `${compatibleBoards.length} listed motherboards support this memory type.`,
      'Check the motherboard memory QVL and supported speed before purchasing.',
    ]
  }

  if (part.category === 'Case') {
    return [
      `Motherboard form factor: ${part.compatibility.motherboardFormFactor ?? 'See case specifications'}.`,
      `Maximum listed graphics-card length: ${part.compatibility.maxGpuLengthMm ?? 'Not listed'} mm.`,
      'Check radiator, cooler-height, and cable-clearance requirements against your selected components.',
    ]
  }

  if (part.category === 'PSU') {
    return [
      `${part.compatibility.psuWattage ?? 'Not listed'} W rated output.`,
      'For a comfortable margin, choose at least 125% of the combined component TDP.',
      'Confirm connector and power-standard requirements for your graphics card.',
    ]
  }

  return ['Review the listed specifications against the requirements of your build.']
}

function PartDetail() {
  const { id } = useParams()
  const part = parts.find((item) => item.id === id)
  const addToCart = useCartStore((state) => state.add)
  const compareIds = useCompareStore((state) => state.partIds)
  const toggleCompare = useCompareStore((state) => state.toggle)
  const navigate = useNavigate()

  if (!part) {
    return (
      <Container className="part-missing">
        <p className="destination-page__eyebrow">PART NOT FOUND</p>
        <h1>That component is off the grid.</h1>
        <Link className="ui-button ui-button--primary" to="/parts">Explore all parts</Link>
      </Container>
    )
  }

  const isCompared = compareIds.includes(part.id)
  const isCompareFull = compareIds.length >= 3 && !isCompared
  const partForCart = { ...part, kind: 'part' as const }

  function buyNow() {
    addToCart(partForCart)
    navigate('/checkout', { state: { buyNow: partForCart.id } })
  }

  function comparePart() {
    if (!isCompared) toggleCompare(partForCart.id)
    navigate('/parts?compare=1')
  }

  return (
    <div className="part-detail">
      <Container>
        <nav aria-label="Breadcrumb" className="prebuilt-breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/parts">Parts</Link><span aria-hidden="true">/</span><Link to={`/parts?category=${part.category.toLowerCase()}`}>{part.category}</Link><span aria-hidden="true">/</span><span aria-current="page">{part.name}</span>
        </nav>
        <div className="part-detail__layout">
          <div className="part-detail__image">
            <LazyImage alt={`${part.brand} ${part.name}`} data-image-reveal height="1000" loading="eager" src={part.image} width="1200" />
            {part.outlet && <span className="part-card__outlet">OUTLET DEAL</span>}
          </div>
          <section aria-labelledby="part-detail-title" className="part-detail__purchase">
            <p className="destination-page__eyebrow">{part.category} · {part.brand}</p>
            <h1 id="part-detail-title">{part.name}</h1>
            <p aria-label={`${part.rating} out of 5 stars`} className="part-detail__rating">★★★★★ <strong>{part.rating.toFixed(1)}</strong></p>
            <p className="part-detail__price">
              {currencyFormatter.format(getPartPrice(part))}
              {part.outlet && part.discountedPrice !== undefined && <del>{currencyFormatter.format(part.price)}</del>}
            </p>
            <span className={`part-stock part-stock--${part.stock}`}>
              <span aria-hidden="true" />
              {part.stock === 'in-stock' ? 'In stock' : part.stock === 'low-stock' ? 'Low stock' : 'Made to order'}
            </span>
            <DeliveryBadge item={part} />
            <div className="part-detail__actions">
              <AddToCartButton arrow className="ui-button ui-button--primary" item={partForCart} />
              <button className="ui-button ui-button--outline" onClick={buyNow} type="button">Buy Now</button>
              <button
                aria-pressed={isCompared}
                className="part-detail__compare"
                disabled={isCompareFull}
                onClick={comparePart}
                type="button"
              >
                {isCompared ? 'View comparison' : 'Add to compare'} <Icon name="arrow" />
              </button>
              {isCompareFull && <p className="part-detail__compare-note">Remove a part from comparison before adding another.</p>}
            </div>
            <p className="part-detail__assurance">Secure checkout · Genuine components · Easy returns</p>
          </section>
        </div>

        <div className="part-detail__information">
          <section aria-labelledby="part-specifications-title">
            <p className="destination-page__eyebrow">THE DETAILS</p>
            <h2 id="part-specifications-title">Specifications</h2>
            <dl className="part-spec-table">
              {Object.entries(part.specs).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>
              ))}
              {Object.entries(part.compatibility).map(([label, value]) => (
                <div key={label}><dt>{label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`).replace(/^./, (letter) => letter.toUpperCase())}</dt><dd>{String(value)}{label === 'gpuLengthMm' || label === 'maxGpuLengthMm' ? ' mm' : label === 'psuWattage' || label === 'tdp' ? ' W' : ''}</dd></div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="part-compatibility-title" className="part-detail__compatibility">
            <p className="destination-page__eyebrow">BUILD NOTES</p>
            <h2 id="part-compatibility-title">Compatibility notes</h2>
            <ul>
              {getCompatibilityNotes(part).map((note) => <li key={note}>{note}</li>)}
            </ul>
            <Link to="/build-help/compatibility-guide">Open compatibility guide <Icon name="arrow" /></Link>
          </section>
        </div>
      </Container>
    </div>
  )
}

export default PartDetail
