import { useMemo, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import { Link, useSearchParams } from 'react-router-dom'
import PrebuiltCard from '../components/shop/PrebuiltCard'
import Container from '../components/ui/Container'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'
import { prebuilts } from '../data/prebuilts'

type SortOrder = 'popular' | 'price-low' | 'price-high' | 'newest'
interface CatalogFilters {
  minimum: number
  maximum: number
  cpu: string
  gpu: string
  useCase: string
}

const maxPrice = Math.ceil(Math.max(...prebuilts.map(({ price }) => price)) / 500) * 500
const cpuBrands = [...new Set(prebuilts.map((item) => item.specs.CPU.split(' ')[0] === 'AMD' ? 'AMD' : 'Intel'))]
const gpuTiers = [...new Set(prebuilts.map((item) => getGpuTier(item.specs.GPU)))]
const useCases = [...new Set(prebuilts.map(({ category }) => category))]
const initialFilters = (): CatalogFilters => ({ minimum: 0, maximum: maxPrice, cpu: '', gpu: '', useCase: '' })

function getGpuTier(gpu: string): string {
  if (/RTX\s*5090/i.test(gpu)) return 'GeForce RTX 5090'
  if (/RTX\s*5080/i.test(gpu)) return 'GeForce RTX 5080'
  if (/RTX\s*5070/i.test(gpu)) return 'GeForce RTX 5070'
  if (/RX\s*90/i.test(gpu)) return 'Radeon RX 90 Series'
  return 'Other GPUs'
}

function Prebuilts() {
  const [searchParams] = useSearchParams()
  const initialUseCase = searchParams.get('useCase')
  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    ...initialFilters(),
    useCase: useCases.find((useCase) => useCase === initialUseCase) ?? '',
  }))
  const [sort, setSort] = useState<SortOrder>('popular')
  const reducedMotion = useReducedMotion()

  const filteredPrebuilts = useMemo(() => {
    const matches = prebuilts
      .map((prebuilt, originalIndex) => ({ prebuilt, originalIndex }))
      .filter(({ prebuilt }) => (
        prebuilt.price >= filters.minimum &&
        prebuilt.price <= filters.maximum &&
        (!filters.cpu || prebuilt.specs.CPU.startsWith(filters.cpu)) &&
        (!filters.gpu || getGpuTier(prebuilt.specs.GPU) === filters.gpu) &&
        (!filters.useCase || prebuilt.category === filters.useCase)
      ))

    return matches.sort((a, b) => {
      if (sort === 'price-low') return a.prebuilt.price - b.prebuilt.price
      if (sort === 'price-high') return b.prebuilt.price - a.prebuilt.price
      if (sort === 'newest') return b.originalIndex - a.originalIndex
      return b.prebuilt.rating - a.prebuilt.rating
    })
  }, [filters, sort])

  const chips = [
    ...(filters.minimum > 0 ? [{ key: 'minimum', label: `From ${currencyFormatter.format(filters.minimum)}` }] : []),
    ...(filters.maximum < maxPrice ? [{ key: 'maximum', label: `To ${currencyFormatter.format(filters.maximum)}` }] : []),
    ...(filters.cpu ? [{ key: 'cpu', label: filters.cpu }] : []),
    ...(filters.gpu ? [{ key: 'gpu', label: filters.gpu }] : []),
    ...(filters.useCase ? [{ key: 'useCase', label: filters.useCase }] : []),
  ]

  function clearFilters() {
    setFilters(initialFilters())
  }

  function removeChip(key: string) {
    setFilters((current) => ({ ...current, [key]: key === 'minimum' ? 0 : key === 'maximum' ? maxPrice : '' }))
  }

  const hasFilters = chips.length > 0

  return (
    <div className="prebuilt-catalog">
      <Container>
        <div className="prebuilt-catalog__hero">
          <div>
            <p className="destination-page__eyebrow">BUILT. TESTED. READY.</p>
            <h1>Prebuilt PCs<span>.</span></h1>
            <p>Expertly matched components, carefully assembled, and ready for what you do next.</p>
          </div>
          <Link className="prebuilt-catalog__help" to="/build-help">
            Need help choosing? <Icon name="arrow" />
          </Link>
        </div>

        <section aria-label="Filter prebuilt PCs" className="catalog-controls">
          <div className="catalog-controls__top">
            <p><strong>{filteredPrebuilts.length}</strong> {filteredPrebuilts.length === 1 ? 'BUILD' : 'BUILDS'} TO EXPLORE</p>
            <label className="catalog-sort">
              <span>Sort by</span>
              <select onChange={(event) => setSort(event.target.value as SortOrder)} value={sort}>
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
          <div className="catalog-filters">
            <label className="catalog-filter catalog-filter--price">
              <span>Price range</span>
              <span className="catalog-filter__range">
                <span className="catalog-filter__input">
                  <span>$</span>
                  <input aria-label="Minimum price" max={maxPrice} min="0" onChange={(event) => setFilters((current) => ({ ...current, minimum: Math.min(Number(event.target.value), current.maximum) }))} step="100" type="number" value={filters.minimum} />
                </span>
                <span aria-hidden="true">—</span>
                <span className="catalog-filter__input">
                  <span>$</span>
                  <input aria-label="Maximum price" max={maxPrice} min="0" onChange={(event) => setFilters((current) => ({ ...current, maximum: Math.max(Number(event.target.value), current.minimum) }))} step="100" type="number" value={filters.maximum} />
                </span>
              </span>
            </label>
            <label className="catalog-filter">
              <span>CPU brand</span>
              <select onChange={(event) => setFilters((current) => ({ ...current, cpu: event.target.value }))} value={filters.cpu}>
                <option value="">All CPU brands</option>
                {cpuBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </label>
            <label className="catalog-filter">
              <span>GPU tier</span>
              <select onChange={(event) => setFilters((current) => ({ ...current, gpu: event.target.value }))} value={filters.gpu}>
                <option value="">All GPU tiers</option>
                {gpuTiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
              </select>
            </label>
            <label className="catalog-filter">
              <span>Use case</span>
              <select onChange={(event) => setFilters((current) => ({ ...current, useCase: event.target.value }))} value={filters.useCase}>
                <option value="">All use cases</option>
                {useCases.map((useCase) => <option key={useCase} value={useCase}>{useCase}</option>)}
              </select>
            </label>
          </div>
          {hasFilters && (
            <div aria-label="Active filters" className="catalog-chips">
              {chips.map((chip) => (
                <button aria-label={`Remove ${chip.label} filter`} className="catalog-chip" key={chip.key} onClick={() => removeChip(chip.key)} type="button">
                  {chip.label}<Icon name="close" />
                </button>
              ))}
              <button className="catalog-chips__clear" onClick={clearFilters} type="button">Clear all</button>
            </div>
          )}
        </section>

        <div aria-live="polite" className="prebuilt-grid">
          <AnimatePresence initial={false}>
            {filteredPrebuilts.map(({ prebuilt }, index) => (
              <PrebuiltCard index={index} key={prebuilt.id} prebuilt={prebuilt} />
            ))}
          </AnimatePresence>
          {filteredPrebuilts.length === 0 && (
            <div className="prebuilt-grid__empty">
              <p className="destination-page__eyebrow">NO MATCHES FOUND</p>
              <h2>Try a different mix.</h2>
              <p>There are no builds with all of these filters. Clear a filter to keep exploring.</p>
              <button className="ui-button ui-button--outline" onClick={clearFilters} type="button">Clear filters</button>
            </div>
          )}
        </div>

        {!reducedMotion && <span aria-hidden="true" className="prebuilt-catalog__bottom-note">YOUR NEXT BUILD IS CLOSER THAN YOU THINK</span>}
      </Container>
    </div>
  )
}

export default Prebuilts
