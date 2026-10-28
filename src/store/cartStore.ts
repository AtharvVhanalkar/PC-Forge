import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Part } from '../data/parts'
import type { Prebuilt } from '../data/prebuilts'

export type CartPartItem = Part & { kind: 'part' }
export type CartPrebuiltItem = Prebuilt & { kind: 'prebuilt' }

export interface CartDigitalItem {
  kind: 'digital'
  id: string
  name: string
  price: number
  image: string
}

export interface CartCustomBuildItem {
  kind: 'custom-build'
  id: string
  name: string
  price: number
  parts: Part[]
  image?: string
  buildOptions?: {
    cableManagement: 'standard' | 'premium'
    colorTheme: string
    operatingSystem: 'none' | 'Windows 11 Home' | 'Windows 11 Pro'
    extendedWarranty: boolean
    rgbLighting: boolean
    assemblyFee: number
  }
}

export type CartItemProduct =
  | CartPartItem
  | CartPrebuiltItem
  | CartDigitalItem
  | CartCustomBuildItem

export type CartLineItem = CartItemProduct & { quantity: number }
export type CouponCode = 'WELCOME10' | 'BUILD5'

export interface CartPricing {
  taxRate: number
  freeShippingThreshold: number
  shippingFee: number
}

export interface CartTotals {
  subtotal: number
  discount: number
  tax: number
  shipping: number
  priorityFee?: number
  total: number
}

export interface CartState {
  items: CartLineItem[]
  couponCode: CouponCode | null
  pricing: CartPricing
  add: (item: CartItemProduct, quantity?: number) => void
  remove: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  clear: () => void
  applyCoupon: (code: string) => boolean
  clearCoupon: () => void
  configurePricing: (pricing: Partial<CartPricing>) => void
  subtotal: () => number
  discount: () => number
  tax: () => number
  shipping: () => number
  total: () => number
  getTotals: () => CartTotals
}

const DEFAULT_PRICING: CartPricing = {
  taxRate: 0.18,
  freeShippingThreshold: 1000,
  shippingFee: 25,
}

function assertValidPricing(pricing: CartPricing): void {
  if (
    !Number.isFinite(pricing.taxRate) ||
    pricing.taxRate < 0 ||
    pricing.taxRate > 1 ||
    !Number.isFinite(pricing.freeShippingThreshold) ||
    pricing.freeShippingThreshold < 0 ||
    !Number.isFinite(pricing.shippingFee) ||
    pricing.shippingFee < 0
  ) {
    throw new RangeError('Cart pricing must contain valid non-negative values.')
  }
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    throw new RangeError('Cart quantity must be a finite number.')
  }

  return Math.min(10, Math.max(1, Math.trunc(quantity)))
}

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      pricing: DEFAULT_PRICING,
      add: (item, quantity = 1) =>
        set((state) => {
          const amount = clampQuantity(quantity)
          const existing = state.items.find(
            (line) => line.id === item.id && line.kind === item.kind,
          )

          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === item.id && line.kind === item.kind
                  ? { ...line, quantity: clampQuantity(line.quantity + amount) }
                  : line,
              ),
            }
          }

          const cartItem =
            item.kind === 'part' && item.outlet && item.discountedPrice !== undefined
              ? { ...item, price: item.discountedPrice }
              : item

          return {
            items: [...state.items, { ...cartItem, quantity: amount }],
          }
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQty: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: clampQuantity(quantity) } : item,
          ),
        })),
      clear: () => set({ items: [], couponCode: null }),
      applyCoupon: (code) => {
        const normalizedCode = code.trim().toUpperCase()
        if (normalizedCode !== 'WELCOME10' && normalizedCode !== 'BUILD5') {
          return false
        }

        set({ couponCode: normalizedCode })
        return true
      },
      clearCoupon: () => set({ couponCode: null }),
      configurePricing: (pricing) =>
        set((state) => {
          const nextPricing = { ...state.pricing, ...pricing }
          assertValidPricing(nextPricing)
          return { pricing: nextPricing }
        }),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      discount: () => {
        const { couponCode } = get()
        const rate = couponCode === 'WELCOME10' ? 0.1 : couponCode === 'BUILD5' ? 0.05 : 0
        return roundMoney(get().subtotal() * rate)
      },
      tax: () =>
        roundMoney(
          (get().subtotal() - get().discount()) * get().pricing.taxRate,
        ),
      shipping: () => {
        const shippableSubtotal = get().items.reduce(
          (subtotal, item) =>
            item.kind === 'digital' ? subtotal : subtotal + item.price * item.quantity,
          0,
        )
        if (shippableSubtotal === 0 || shippableSubtotal >= get().pricing.freeShippingThreshold) {
          return 0
        }
        return get().pricing.shippingFee
      },
      total: () =>
        roundMoney(
          get().subtotal() -
            get().discount() +
            get().tax() +
            get().shipping(),
        ),
      getTotals: () => ({
        subtotal: get().subtotal(),
        discount: get().discount(),
        tax: get().tax(),
        shipping: get().shipping(),
        total: get().total(),
      }),
    }),
    { name: 'pcforge-cart' },
  ),
)
