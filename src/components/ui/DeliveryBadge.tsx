import {
  formatDeliveryDate,
  getItemEta,
  type DeliveryItem,
  type ItemEta,
} from '../../lib/delivery'

interface DeliveryBadgeProps {
  item?: DeliveryItem
  eta?: ItemEta
}

function DeliveryBadge({ item, eta }: DeliveryBadgeProps) {
  const delivery = item ? getItemEta(item) : eta
  if (!delivery) throw new Error('DeliveryBadge requires an item or ETA.')
  const { days, arrivalDate } = delivery

  return (
    <span className="delivery-badge">
      <svg
        className="delivery-badge__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7.5" cy="18" r="1.75" />
        <circle cx="18" cy="18" r="1.75" />
        <path d="M5 9h5M5 12h4" />
      </svg>
      <span>
        Arrives in {days} days, by {formatDeliveryDate(arrivalDate, '')}
      </span>
    </span>
  )
}

export default DeliveryBadge
