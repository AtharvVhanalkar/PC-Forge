import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { currencyFormatter } from '../../config'
import { parts } from '../../data/parts'
import { getPartPrice } from '../../lib/partsCatalog'
import { useCompareStore } from '../../store/compareStore'
import Icon from '../layout/Icon'

interface PartCompareDrawerProps {
  open: boolean
  onClose: () => void
}

function PartCompareDrawer({ open, onClose }: PartCompareDrawerProps) {
  const partIds = useCompareStore((state) => state.partIds)
  const remove = useCompareStore((state) => state.remove)
  const reducedMotion = useReducedMotion()
  const drawerRef = useRef<HTMLElement>(null)
  const selectedParts = partIds
    .map((id) => parts.find((part) => part.id === id))
    .filter((part) => part !== undefined)
  const specRows = [...new Set(selectedParts.flatMap((part) => Object.keys(part.specs)))]

  useEffect(() => {
    if (!open) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    const drawer = drawerRef.current
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])'
    drawer?.querySelector<HTMLElement>('button:not([disabled])')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !drawer) return
      const focusable = drawer.querySelectorAll<HTMLElement>(focusableSelector)
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

    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousActiveElement?.focus()
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="overlay-backdrop part-compare-backdrop"
          exit={reducedMotion ? undefined : { opacity: 0 }}
          initial={reducedMotion ? false : { opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.aside
            animate={{ y: 0 }}
            aria-label="Compare selected parts"
            aria-modal="true"
            className="part-compare-drawer"
            initial={reducedMotion ? false : { y: '100%' }}
            onClick={(event) => event.stopPropagation()}
            ref={drawerRef}
            role="dialog"
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="part-compare-drawer__header">
              <div>
                <p className="destination-page__eyebrow">SIDE-BY-SIDE</p>
                <h2>Compare parts <span>({selectedParts.length}/3)</span></h2>
              </div>
              <button aria-label="Close comparison" className="header-action" onClick={onClose} type="button">
                <Icon name="close" />
              </button>
            </header>
            {selectedParts.length > 0 ? (
              <div className="part-compare-drawer__table-wrap">
                <table className="part-compare-table">
                  <thead>
                    <tr>
                      <th scope="col">Specification</th>
                      {selectedParts.map((part) => (
                        <th key={part.id} scope="col">
                          <span>{part.brand}</span>
                          <strong>{part.name}</strong>
                          <button aria-label={`Remove ${part.name} from comparison`} onClick={() => remove(part.id)} type="button">Remove</button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr><th scope="row">Category</th>{selectedParts.map((part) => <td key={part.id}>{part.category}</td>)}</tr>
                    <tr><th scope="row">Price</th>{selectedParts.map((part) => <td key={part.id}>{currencyFormatter.format(getPartPrice(part))}</td>)}</tr>
                    <tr><th scope="row">Availability</th>{selectedParts.map((part) => <td key={part.id}>{part.stock.replaceAll('-', ' ')}</td>)}</tr>
                    <tr><th scope="row">Rating</th>{selectedParts.map((part) => <td key={part.id}>★ {part.rating.toFixed(1)}</td>)}</tr>
                    {specRows.map((key) => (
                      <tr key={key}>
                        <th scope="row">{key}</th>
                        {selectedParts.map((part) => <td key={part.id}>{part.specs[key] === undefined ? '—' : String(part.specs[key])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="part-compare-drawer__empty">
                <h3>No parts selected</h3>
                <p>Select up to three products to compare their specs and prices.</p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PartCompareDrawer
