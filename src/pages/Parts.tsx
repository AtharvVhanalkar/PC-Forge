import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import PartCard from '../components/shop/PartCard'
import PartCompareDrawer from '../components/shop/PartCompareDrawer'
import { parts, partCategories, type Part, type PartCategory } from '../data/parts'
import { filterParts, getPartFacet, getPartPrice, type PartFilters, type PartSortOrder } from '../lib/partsCatalog'
import { useCompareStore } from '../store/compareStore'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'

interface PartsProps {
  initialCategory?: PartCategory
}

const maximumPrice = Math.ceil(Math.max(...parts.map(getPartPrice)) / 100) * 100

function emptyFilters(): Omit<PartFilters, 'category' | 'sort'> {
  return {
    brand: '',
    minimum: 0,
    maximum: maximumPrice,
    specValue: '',
    inStockOnly: false,
    search: '',
  }
}

function Parts({ initialCategory }: PartsProps) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const outletOnly = searchParams.get('outlet') === '1'
  const category = initialCategory ?? partCategories.find(
    (value) => value.toLowerCase() === searchParams.get('category'),
  ) ?? null
  const categoryKey = category ?? 'all'
  const [filterState, setFilterState] = useState(() => ({
    categoryKey,
    values: emptyFilters(),
  }))
  const filters = filterState.categoryKey === categoryKey ? filterState.values : emptyFilters()
  const [sort, setSort] = useState<PartSortOrder>('featured')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(() => searchParams.get('compare') === '1')
  const partIds = useCompareStore((state) => state.partIds)
  const toggleCompare = useCompareStore((state) => state.toggle)

  function updateFilters(
    update: (current: ReturnType<typeof emptyFilters>) => ReturnType<typeof emptyFilters>,
  ) {
    setFilterState({ categoryKey, values: update(filters) })
  }

  const categoryParts = useMemo(
    () => parts.filter((part) => !category || part.category === category),
    [category],
  )
  const brands = useMemo(
    () => [...new Set(categoryParts.map((part) => part.brand))].sort((a, b) => a.localeCompare(b)),
    [categoryParts],
  )
  const facetLabel = category ? categoryParts.map(getPartFacet).find((facet) => facet !== null)?.label : undefined
  const facetValues = useMemo(
    () => [...new Set(categoryParts.map(getPartFacet).flatMap((facet) => facet ? [facet.value] : []))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [categoryParts],
  )
  const filteredParts = filterParts(parts, { ...filters, category, sort })
    .filter((part) => !outletOnly || (part.outlet && part.discountedPrice !== undefined))
  const hasActiveFilters = Boolean(
    outletOnly || filters.brand || filters.minimum || filters.maximum < maximumPrice ||
    filters.specValue || filters.inStockOnly || filters.search,
  )

  function selectCategory(nextCategory: PartCategory | null) {
    const params = new URLSearchParams()
    if (nextCategory) params.set('category', nextCategory.toLowerCase())
    if (outletOnly) params.set('outlet', '1')
    const query = params.size ? `?${params}` : ''
    navigate(`/parts${query}`)
  }

  function clearFilters() {
    setFilterState({ categoryKey, values: emptyFilters() })
  }

  function closeCompare() {
    setCompareOpen(false)
    if (searchParams.has('compare')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('compare')
      navigate(`${location.pathname}${nextParams.size ? `?${nextParams}` : ''}`, { replace: true })
    }
  }

  const categoryList = (
    <div className="parts-category-list">
      <button aria-pressed={category === null} onClick={() => selectCategory(null)} type="button">
        <span>All components</span><span>{parts.length}</span>
      </button>
      {partCategories.map((partCategory) => {
        const count = parts.filter((part) => part.category === partCategory).length
        return (
          <button
            aria-pressed={category === partCategory}
            key={partCategory}
            onClick={() => selectCategory(partCategory)}
            type="button"
          >
            <span>{partCategory}</span><span>{count}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="parts-page">
      <Container>
        <div className="parts-page__hero">
          <div>
            <p className="destination-page__eyebrow">COMPONENTS · GEAR · UPGRADES</p>
            <h1>{outletOnly ? 'Outlet components' : 'Find your next part'}<span>.</span></h1>
            <p>{outletOnly ? 'Browse discounted mock catalog components with outlet pricing.' : 'Choose the right component for your next build, with the specs and fit information up front.'}</p>
          </div>
          <Link className="parts-page__build-link" to="/build-help/compatibility-guide">
            Need compatibility help? <Icon name="arrow" />
          </Link>
        </div>

        <div className="parts-layout">
          <aside aria-label="Parts filters" className="parts-sidebar">
            <div className="parts-sidebar__category-heading">
              <h2>Categories</h2>
              <button
                aria-controls="parts-category-list"
                aria-expanded={categoryOpen}
                className="parts-sidebar__toggle"
                onClick={() => setCategoryOpen((open) => !open)}
                type="button"
              >
                {categoryOpen ? 'Hide' : 'Browse'} <Icon className="parts-sidebar__toggle-icon" name="arrow" />
              </button>
            </div>
            <div className={`parts-sidebar__categories${categoryOpen ? ' is-open' : ''}`} id="parts-category-list">
              {categoryList}
            </div>

            <div className="parts-sidebar__filters">
              <div className="parts-sidebar__filters-heading">
                <h2>Refine results</h2>
                {hasActiveFilters && <button onClick={clearFilters} type="button">Clear</button>}
              </div>
              <label className="parts-filter">
                <span>Brand</span>
                <select onChange={(event) => updateFilters((current) => ({ ...current, brand: event.target.value }))} value={filters.brand}>
                  <option value="">All brands</option>
                  {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </label>
              <fieldset className="parts-filter parts-filter--price">
                <legend>Price range</legend>
                <div>
                  <label>
                    <span className="sr-only">Minimum price</span>
                    <span aria-hidden="true">$</span>
                    <input
                      aria-label="Minimum price"
                      max={filters.maximum}
                      min="0"
                      onChange={(event) => updateFilters((current) => ({ ...current, minimum: Math.min(Number(event.target.value), current.maximum) }))}
                      step="10"
                      type="number"
                      value={filters.minimum}
                    />
                  </label>
                  <span aria-hidden="true">–</span>
                  <label>
                    <span className="sr-only">Maximum price</span>
                    <span aria-hidden="true">$</span>
                    <input
                      aria-label="Maximum price"
                      max={maximumPrice}
                      min={filters.minimum}
                      onChange={(event) => updateFilters((current) => ({ ...current, maximum: Math.max(Number(event.target.value), current.minimum) }))}
                      step="10"
                      type="number"
                      value={filters.maximum}
                    />
                  </label>
                </div>
                <small>{currencyFormatter.format(filters.minimum)} – {currencyFormatter.format(filters.maximum)}</small>
              </fieldset>
              {facetLabel && (
                <label className="parts-filter">
                  <span>{facetLabel}</span>
                  <select onChange={(event) => updateFilters((current) => ({ ...current, specValue: event.target.value }))} value={filters.specValue}>
                    <option value="">Any {facetLabel.toLowerCase()}</option>
                    {facetValues.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              )}
              <label className="parts-stock-filter">
                <input
                  checked={filters.inStockOnly}
                  onChange={(event) => updateFilters((current) => ({ ...current, inStockOnly: event.target.checked }))}
                  type="checkbox"
                />
                <span>In-stock only</span>
              </label>
            </div>
          </aside>

          <section aria-label="Parts catalog" className="parts-results">
            <div className="parts-results__toolbar">
              <label className="parts-search">
                <Icon name="search" />
                <span className="sr-only">Search parts</span>
                <input
                  onChange={(event) => updateFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search parts, brands, or specs"
                  type="search"
                  value={filters.search}
                />
              </label>
              <label className="parts-sort">
                <span>Sort by</span>
                <select onChange={(event) => setSort(event.target.value as PartSortOrder)} value={sort}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top rated</option>
                </select>
              </label>
            </div>
            <div aria-live="polite" className="parts-results__count">
              <p><strong>{filteredParts.length}</strong> {filteredParts.length === 1 ? 'PART' : 'PARTS'} {outletOnly ? 'ON OUTLET' : category ? `IN ${category.toUpperCase()}` : 'TO EXPLORE'}</p>
              {hasActiveFilters && <button onClick={clearFilters} type="button">Clear filters</button>}
            </div>
            {filteredParts.length > 0 ? (
              <div className="parts-grid">
                {filteredParts.map((part: Part) => {
                  const selected = partIds.includes(part.id)
                  return (
                    <PartCard
                      compareDisabled={!selected && partIds.length >= 3}
                      compareSelected={selected}
                      key={part.id}
                      onToggleCompare={() => toggleCompare(part.id)}
                      part={part}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="parts-empty">
                <p className="destination-page__eyebrow">NO MATCHES</p>
                <h2>Nothing in this filter combination.</h2>
                <p>Try a different search, price range, or specification.</p>
                <button className="ui-button ui-button--outline" onClick={clearFilters} type="button">Clear filters</button>
              </div>
            )}
          </section>
        </div>
      </Container>

      {partIds.length > 0 && (
        <button className="parts-compare-trigger ui-button ui-button--primary" onClick={() => setCompareOpen(true)} type="button">
          Compare parts <span>{partIds.length}</span>
        </button>
      )}
      <PartCompareDrawer onClose={closeCompare} open={compareOpen} />
    </div>
  )
}

export default Parts
