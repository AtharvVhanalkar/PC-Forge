import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { currencyFormatter } from '../../config'
import { parts } from '../../data/parts'
import { prebuilts } from '../../data/prebuilts'
import Icon from './Icon'
import AddToCartButton from '../shop/AddToCartButton'
import LazyImage from '../ui/LazyImage'

interface SearchOverlayProps {
  onClose: () => void
}

function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const reducedMotion = useReducedMotion()

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const partResults = parts.map((part) => ({
      id: part.id,
      name: part.name,
      detail: `${part.brand} · ${part.category}`,
      price: part.outlet && part.discountedPrice !== undefined ? part.discountedPrice : part.price,
      image: part.image,
      kind: 'part' as const,
      product: { ...part, kind: 'part' as const },
      to: `/parts/${part.category.toLowerCase()}/${part.id}`,
      searchText: `${part.brand} ${part.name} ${part.category} ${Object.values(part.specs).join(' ')}`,
    }))
    const prebuiltResults = prebuilts.map((prebuilt) => ({
      id: prebuilt.id,
      name: prebuilt.name,
      detail: `${prebuilt.category} · Custom-built PC`,
      price: prebuilt.price,
      image: prebuilt.images[0],
      kind: 'prebuilt' as const,
      product: { ...prebuilt, kind: 'prebuilt' as const },
      to: `/prebuilts/${prebuilt.id}`,
      searchText: `${prebuilt.name} ${prebuilt.tagline} ${prebuilt.category} ${Object.values(prebuilt.specs).join(' ')}`,
    }))

    return [...partResults, ...prebuiltResults]
      .filter((result) => !normalizedQuery || result.searchText.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 8)
  }, [query])

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => previousActiveElement?.focus()
  }, [])

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="overlay-backdrop search-backdrop"
      exit={reducedMotion ? undefined : { opacity: 0 }}
      initial={reducedMotion ? false : { opacity: 0 }}
      onClick={onClose}
      onKeyDown={trapFocus}
      role="dialog"
      aria-label="Search products"
      aria-modal="true"
    >
      <motion.section
        animate={{ y: 0 }}
        className="search-overlay"
        initial={reducedMotion ? false : { y: -18 }}
        onClick={(event) => event.stopPropagation()}
        transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
      >
        <div className="search-overlay__top">
          <div className="search-overlay__brand">Find parts & PCs</div>
          <button aria-label="Close search" className="header-action" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <label className="search-overlay__field">
          <Icon name="search" />
          <input
            aria-label="Search parts and prebuilts"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search PCs, GPUs, processors..."
            ref={inputRef}
            type="search"
            value={query}
          />
          <kbd>ESC</kbd>
        </label>
        <div aria-live="polite" className="search-overlay__results">
          <p className="search-overlay__eyebrow">{query.trim() ? 'Search results' : 'Popular right now'}</p>
          {results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li className="search-result" key={`${result.kind}-${result.id}`}>
                  <Link className="search-result__product" onClick={onClose} to={result.to}>
                    <LazyImage alt="" loading="lazy" src={result.image} />
                    <span className="search-result__copy">
                      <strong>{result.name}</strong>
                      <span>{result.detail}</span>
                    </span>
                    <span className="search-result__price">{currencyFormatter.format(result.price)}</span>
                  </Link>
                  <AddToCartButton
                    aria-label={`Add ${result.name} to cart`}
                    className="search-result__add"
                    item={result.product}
                    label="Add"
                    onAdded={() => window.setTimeout(onClose, 600)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-overlay__empty">No products match “{query}”. Try a different search.</p>
          )}
        </div>
        <div className="search-overlay__hint">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to browse</span><span><kbd>ESC</kbd> to close</span>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default SearchOverlay
