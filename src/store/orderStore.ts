import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getCartEta,
  getItemEta,
  type DeliveryDays,
} from '../lib/delivery.ts'
import type { CartLineItem, CartTotals } from './cartStore.ts'

export interface OrderCustomer {
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
}

export interface OrderAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface OrderPayment {
  method: 'card' | 'upi' | 'cash-on-delivery'
  last4?: string
  provider?: string
}

export interface OrderDelivery {
  method: 'standard' | 'priority'
  priorityFee: number
}

export type OrderStatus =
  | 'placed'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderTimelineEntry {
  status: OrderStatus
  label: string
  at: string | null
}

export interface OrderEta {
  days: DeliveryDays | 0
  arrivalDate: string
  label: string
}

export type OrderItem = CartLineItem & { eta: OrderEta }

export interface Order {
  id: string
  placedAt: string
  status: OrderStatus
  timeline: OrderTimelineEntry[]
  customer: OrderCustomer
  address: OrderAddress
  payment: OrderPayment
  delivery: OrderDelivery
  items: OrderItem[]
  totals: CartTotals
  eta: OrderEta
}

export interface OrderState {
  orders: Order[]
  placeOrder: (
    customer: OrderCustomer,
    address: OrderAddress,
    payment: OrderPayment,
    items: readonly CartLineItem[],
    totals: CartTotals,
    delivery?: OrderDelivery,
  ) => Order
  getOrders: () => Order[]
  getOrder: (id: string) => Order | undefined
}

const ORDER_STATUSES: Array<Pick<OrderTimelineEntry, 'status' | 'label'>> = [
  { status: 'placed', label: 'Order placed' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out-for-delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' },
]

const STANDARD_DELIVERY: OrderDelivery = { method: 'standard', priorityFee: 0 }

function toOrderEta(eta: ReturnType<typeof getItemEta>): OrderEta {
  return {
    days: eta.days,
    arrivalDate: eta.arrivalDate.toISOString(),
    label: eta.label,
  }
}

function getItemOrderEta(item: CartLineItem, referenceDate: Date): OrderEta {
  if (item.kind === 'digital') {
    return {
      days: 0,
      arrivalDate: referenceDate.toISOString(),
      label: 'Available immediately',
    }
  }

  return toOrderEta(getItemEta(item, referenceDate))
}

function cloneCartItem(item: CartLineItem): CartLineItem {
  if (item.kind === 'part') {
    return {
      ...item,
      specs: { ...item.specs },
      compatibility: { ...item.compatibility },
    }
  }

  if (item.kind === 'prebuilt') {
    return {
      ...item,
      specs: { ...item.specs },
      fps: { ...item.fps },
      images: [...item.images],
      badges: [...item.badges],
    }
  }

  if (item.kind === 'digital') return { ...item }

  return {
    ...item,
    parts: item.parts.map((part) => ({
      ...part,
      specs: { ...part.specs },
      compatibility: { ...part.compatibility },
    })),
  }
}

function createOrderId(placedAt: Date, existingOrders: readonly Order[]): string {
  const year = placedAt.getFullYear()
  let id: string

  do {
    const number = Math.floor(10000 + Math.random() * 90000)
    id = `PCF-${year}-${number}`
  } while (existingOrders.some((order) => order.id === id))

  return id
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      placeOrder: (customer, address, payment, items, totals, delivery = STANDARD_DELIVERY) => {
        if (items.length === 0) {
          throw new RangeError('Cannot place an order without items.')
        }

        const now = new Date()
        const placedAt = now.toISOString()
        const shippableItems = items.filter(
          (item): item is Exclude<CartLineItem, { kind: 'digital' }> =>
            item.kind !== 'digital',
        )
        const eta = shippableItems.length > 0
          ? toOrderEta(getCartEta(shippableItems, now))
          : getItemOrderEta(items[0]!, now)
        const order: Order = {
          id: createOrderId(now, get().orders),
          placedAt,
          status: 'placed',
          timeline: ORDER_STATUSES.map(({ status, label }) => ({
            status,
            label,
            at: status === 'placed' ? placedAt : null,
          })),
          customer: { ...customer },
          address: { ...address },
          payment: { ...payment },
          delivery: { ...delivery },
          items: items.map((item) => ({
            ...cloneCartItem(item),
            eta: getItemOrderEta(item, now),
          })),
          totals: { ...totals },
          eta,
        }

        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      getOrders: () => [...get().orders],
      getOrder: (id) => get().orders.find((order) => order.id === id),
    }),
    { name: 'pcforge-orders' },
  ),
)
