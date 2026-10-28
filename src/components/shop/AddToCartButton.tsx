import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { useCartStore, type CartItemProduct } from '../../store/cartStore'
import Icon from '../layout/Icon'

type AddToCartButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  onAdded?: () => void
  quantity?: number
  label?: string
  arrow?: boolean
} & (
  | { item: CartItemProduct; onAdd?: never; itemName?: never }
  | { item?: never; onAdd: () => void; itemName: string }
)

function AddToCartButton({
  item,
  onAdd,
  onAdded,
  itemName,
  quantity = 1,
  label = 'Add to Cart',
  arrow = false,
  className = '',
  ...buttonProps
}: AddToCartButtonProps) {
  const add = useCartStore((state) => state.add)
  const [added, setAdded] = useState(false)
  const resetTimeout = useRef<number | null>(null)

  useEffect(() => () => {
    if (resetTimeout.current !== null) window.clearTimeout(resetTimeout.current)
  }, [])

  function addItem() {
    if (item) add(item, quantity)
    else onAdd?.()
    onAdded?.()
    setAdded(true)
    if (resetTimeout.current !== null) window.clearTimeout(resetTimeout.current)
    resetTimeout.current = window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <button
      {...buttonProps}
      aria-label={added ? `${item?.name ?? itemName ?? label} added to cart` : buttonProps['aria-label']}
      className={`${className}${added ? ' is-added' : ''}`.trim()}
      onClick={addItem}
      type="button"
    >
      {added ? <><Icon name="check" /><span>Added</span></> : <>{label}{arrow && <Icon name="arrow" />}</>}
    </button>
  )
}

export default AddToCartButton
