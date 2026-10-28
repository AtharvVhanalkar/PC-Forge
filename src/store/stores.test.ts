/// <reference types="node" />

import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { parts } from '../data/parts.ts'
import { prebuilts } from '../data/prebuilts.ts'
import type {
  CartCustomBuildItem,
  CartDigitalItem,
  CartPartItem,
  CartPrebuiltItem,
} from './cartStore.ts'
import { getEstimatedOfferRange } from '../lib/sellParts.ts'

const storageValues = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return storageValues.size
  },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(key) ?? null,
  key: (index) => [...storageValues.keys()][index] ?? null,
  removeItem: (key) => storageValues.delete(key),
  setItem: (key, value) => storageValues.set(key, String(value)),
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { localStorage: localStorageMock },
})

const [{ useCartStore }, { useOrderStore }, { useSellStore }, { useBuildStore }, { useAuthStore }] =
  await Promise.all([
    import('./cartStore.ts'),
    import('./orderStore.ts'),
    import('./sellStore.ts'),
    import('./buildStore.ts'),
    import('./authStore.ts'),
  ])

function partById(id: string) {
  const part = parts.find((item) => item.id === id)
  assert.ok(part, `Expected mock part "${id}" to exist`)
  return part
}

function prebuiltById(id: string) {
  const prebuilt = prebuilts.find((item) => item.id === id)
  assert.ok(prebuilt, `Expected mock prebuilt "${id}" to exist`)
  return prebuilt
}

function cartPart(id: string): CartPartItem {
  return { ...partById(id), kind: 'part' }
}

function cartPrebuilt(id: string): CartPrebuiltItem {
  return { ...prebuiltById(id), kind: 'prebuilt' }
}

function customBuild(): CartCustomBuildItem {
  return {
    kind: 'custom-build',
    id: 'my-custom-build',
    name: 'My Custom PC',
    price: 2500,
    parts: [partById('cpu-ryzen-7-9800x3d')],
  }
}

function digitalGuide(): CartDigitalItem {
  return {
    kind: 'digital',
    id: 'ebook-first-time-pc-gamer',
    name: 'First-Time PC Gamer eBook',
    price: 14.99,
    image: 'https://example.com/pc-guide.jpg',
  }
}

beforeEach(() => {
  storageValues.clear()
  useCartStore.setState({
    items: [],
    couponCode: null,
    pricing: {
      taxRate: 0.18,
      freeShippingThreshold: 1000,
      shippingFee: 25,
    },
  })
  useOrderStore.setState({ orders: [] })
  useSellStore.setState({ requests: [] })
  useBuildStore.getState().resetBuild()
  useAuthStore.setState({ account: null, accounts: [] })
  useCartStore.persist.clearStorage()
  useOrderStore.persist.clearStorage()
  useSellStore.persist.clearStorage()
  useBuildStore.persist.clearStorage()
  useAuthStore.persist.clearStorage()
})

test('cart adds, merges, removes, and clamps quantities from 1 to 10', () => {
  const cart = useCartStore.getState()
  cart.add(cartPart('cpu-ryzen-7-9800x3d'), 7)
  cart.add(cartPart('cpu-ryzen-7-9800x3d'), 8)

  assert.equal(useCartStore.getState().items[0]?.quantity, 10)

  useCartStore.getState().updateQty('cpu-ryzen-7-9800x3d', 0)
  assert.equal(useCartStore.getState().items[0]?.quantity, 1)

  useCartStore.getState().updateQty('cpu-ryzen-7-9800x3d', 99)
  assert.equal(useCartStore.getState().items[0]?.quantity, 10)

  useCartStore.getState().remove('cpu-ryzen-7-9800x3d')
  assert.equal(useCartStore.getState().items.length, 0)
})

test('cart supports parts, prebuilts, and custom builds containing parts', () => {
  const cart = useCartStore.getState()
  cart.add(cartPart('cpu-ryzen-7-9800x3d'))
  cart.add(cartPrebuilt('scarlet-fury'))
  cart.add(customBuild())

  const items = useCartStore.getState().items
  assert.deepEqual(
    items.map((item) => item.kind),
    ['part', 'prebuilt', 'custom-build'],
  )
  assert.equal(items[2]?.kind === 'custom-build' ? items[2].parts.length : 0, 1)
})

test('cart supports instant-access digital products', () => {
  useCartStore.getState().add(digitalGuide())
  const item = useCartStore.getState().items[0]

  assert.equal(item?.kind, 'digital')
  assert.equal(item?.name, 'First-Time PC Gamer eBook')
  assert.equal(item?.price, 14.99)
  assert.equal(useCartStore.getState().shipping(), 0)
})

test('outlet parts use their discounted price in the cart', () => {
  useCartStore.getState().add(cartPart('cpu-ryzen-5-9600x'))
  assert.equal(useCartStore.getState().items[0]?.price, 219)
})

test('coupon, tax, shipping and total use configurable pricing', () => {
  const cart = useCartStore.getState()
  cart.add(cartPart('cpu-ryzen-5-9600x'), 2)
  assert.equal(cart.applyCoupon('welcome10'), true)
  assert.equal(cart.applyCoupon('INVALID'), false)

  useCartStore.getState().configurePricing({
    taxRate: 0.1,
    freeShippingThreshold: 400,
    shippingFee: 30,
  })

  assert.deepEqual(useCartStore.getState().getTotals(), {
    subtotal: 438,
    discount: 43.8,
    tax: 39.42,
    shipping: 0,
    total: 433.62,
  })

  assert.equal(useCartStore.getState().applyCoupon('BUILD5'), true)
  assert.equal(useCartStore.getState().discount(), 21.9)
  useCartStore.getState().clear()
  assert.equal(useCartStore.getState().couponCode, null)
  assert.equal(useCartStore.getState().subtotal(), 0)
})

test('cart data rehydrates from localStorage after a page reload', async () => {
  useCartStore.getState().add(cartPart('cpu-ryzen-7-9800x3d'), 2)
  const persistedCart = localStorageMock.getItem('pcforge-cart')
  assert.ok(persistedCart)

  useCartStore.setState({ items: [], couponCode: null })
  localStorageMock.setItem('pcforge-cart', persistedCart)
  await useCartStore.persist.rehydrate()

  assert.equal(useCartStore.getState().items[0]?.quantity, 2)
  assert.equal(useCartStore.getState().items[0]?.id, 'cpu-ryzen-7-9800x3d')
})

test('build preset and draft choices persist in localStorage after reload', async () => {
  useBuildStore.getState().setPreset('1440p-gaming')
  useBuildStore.getState().setPart('GPU', 'gpu-rtx-5070ti')
  useBuildStore.getState().setRgbLighting(true)
  useBuildStore.getState().goToStep(4)
  const savedDraft = localStorageMock.getItem('pcforge-build-draft')
  assert.ok(savedDraft)

  useBuildStore.getState().resetBuild()
  localStorageMock.setItem('pcforge-build-draft', savedDraft)
  await useBuildStore.persist.rehydrate()

  assert.equal(useBuildStore.getState().presetId, null)
  assert.equal(useBuildStore.getState().selectedPartIds.GPU, 'gpu-rtx-5070ti')
  assert.equal(useBuildStore.getState().rgbLighting, true)
  assert.equal(useBuildStore.getState().currentStep, 4)
})

test('mock accounts persist names and emails without storing passwords', async () => {
  const auth = useAuthStore.getState()
  assert.equal(auth.register('Alex Morgan', 'ALEX@example.com'), true)
  assert.equal(auth.register('Other Name', 'alex@example.com'), false)
  assert.equal(useAuthStore.getState().account?.name, 'Alex Morgan')
  useAuthStore.getState().logout()
  assert.equal(useAuthStore.getState().account, null)
  assert.equal(useAuthStore.getState().login('alex@EXAMPLE.com'), true)

  const persistedAccount = localStorageMock.getItem('pcforge-local-account')
  assert.ok(persistedAccount)
  assert.ok(persistedAccount.includes('Alex Morgan'))
  assert.equal(persistedAccount.includes('password'), false)

  useAuthStore.setState({ account: null, accounts: [] })
  localStorageMock.setItem('pcforge-local-account', persistedAccount)
  await useAuthStore.persist.rehydrate()
  assert.equal(useAuthStore.getState().account?.email, 'alex@example.com')
})

test('placeOrder creates a persisted order with timeline and item/cart ETAs', () => {
  useCartStore.getState().add(cartPart('cpu-ryzen-7-9800x3d'))
  useCartStore.getState().add(customBuild())
  const cart = useCartStore.getState()

  const order = useOrderStore.getState().placeOrder(
    {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '+1 555 0100',
    },
    {
      line1: '42 Test Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
    { method: 'card', last4: '4242', provider: 'Visa' },
    cart.items,
    cart.getTotals(),
  )

  assert.match(order.id, /^PCF-\d{4}-\d{5}$/)
  assert.ok(Number.isFinite(Date.parse(order.placedAt)))
  assert.equal(order.status, 'placed')
  assert.equal(order.timeline.length, 5)
  assert.deepEqual(order.timeline.map((entry) => entry.label), [
    'Order placed',
    'Packed',
    'Shipped',
    'Out for delivery',
    'Delivered',
  ])
  assert.equal(order.timeline[0]?.at, order.placedAt)
  assert.equal(order.items.length, 2)
  assert.equal(order.items[0]?.eta.days, 4)
  assert.equal(order.items[1]?.eta.days, 10)
  assert.equal(order.eta.days, 10)
  assert.equal(useOrderStore.getState().getOrder(order.id)?.id, order.id)
  assert.equal(useOrderStore.getState().getOrders().length, 1)
})

test('priority orders preserve mixed item ETAs without storing full card details', () => {
  useCartStore.getState().add(cartPart('cpu-ryzen-7-9800x3d'))
  useCartStore.getState().add(cartPrebuilt('scarlet-fury'))
  useCartStore.getState().add(customBuild())
  useCartStore.getState().add(digitalGuide())
  const cart = useCartStore.getState()
  const fee = 19.99
  const totals = { ...cart.getTotals(), priorityFee: fee, total: cart.total() + fee }
  const order = useOrderStore.getState().placeOrder(
    { name: 'Alex Morgan', email: 'alex@example.com', phone: '+1 555 0100' },
    {
      line1: '42 Test Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
    { method: 'card', last4: '4242', provider: 'Visa' },
    cart.items,
    totals,
    { method: 'priority', priorityFee: fee },
  )

  assert.deepEqual(order.items.map((item) => item.kind), ['part', 'prebuilt', 'custom-build', 'digital'])
  assert.deepEqual(order.items.map((item) => item.eta.days), [4, 4, 10, 0])
  assert.equal(order.eta.days, 10)
  assert.equal(order.delivery.method, 'priority')
  assert.equal(order.totals.priorityFee, fee)
  assert.equal(order.totals.total, totals.total)
  assert.equal(JSON.stringify(order).includes('4111111111111111'), false)
})

test('placeOrder rejects empty carts', () => {
  assert.throws(
    () =>
      useOrderStore.getState().placeOrder(
        {
          name: 'Alex Morgan',
          email: 'alex@example.com',
          phone: '+1 555 0100',
        },
        {
          line1: '42 Test Street',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'US',
        },
        { method: 'upi' },
        [],
        { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 },
      ),
    { name: 'RangeError' },
  )
})

test('digital-only orders mark the ebook available immediately', () => {
  useCartStore.getState().add(digitalGuide())
  const cart = useCartStore.getState()
  const order = useOrderStore.getState().placeOrder(
    {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '+1 555 0100',
    },
    {
      line1: '42 Test Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
    { method: 'card', last4: '4242', provider: 'Visa' },
    cart.items,
    cart.getTotals(),
  )

  assert.equal(order.items[0]?.eta.days, 0)
  assert.equal(order.items[0]?.eta.label, 'Available immediately')
  assert.equal(order.eta.label, 'Available immediately')
})

test('sell requests persist details while masking payout destinations', async () => {
  const offerRange = getEstimatedOfferRange(500, 'Good', 2025, 2026)
  const referenceId = useSellStore.getState().submitSellRequest({
    partType: 'GPU',
    sellerName: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+1 555 0100',
    brand: 'AMD',
    model: 'Radeon RX 7900 XTX',
    purchaseYear: 2025,
    condition: 'Good',
    workingStatus: 'Fully working',
    hasOriginalBox: true,
    hasInvoice: true,
    photoNames: ['front.png'],
    description: 'Works perfectly; box included.',
    askingPrice: 500,
    offerRange,
    address: '42 Test Street, Austin, TX',
    fulfillment: 'Pickup',
    payoutMethod: 'UPI',
    payoutDestination: 'alex@upi',
  })

  assert.match(referenceId, /^SELL-\d{5}$/)
  assert.equal(
    useSellStore.getState().getSellRequest(referenceId)?.sellerName,
    'Alex Morgan',
  )
  assert.equal(useSellStore.getState().getSellRequests().length, 1)
  const persistedRequests = localStorageMock.getItem('pcforge-sell-requests')
  assert.ok(persistedRequests)
  assert.ok(persistedRequests.includes('••••@upi'))
  assert.equal(persistedRequests.includes('alex@upi'), false)
  useSellStore.setState({ requests: [] })
  localStorageMock.setItem('pcforge-sell-requests', persistedRequests)
  await useSellStore.persist.rehydrate()
  assert.equal(useSellStore.getState().getSellRequest(referenceId)?.payoutDestinationMasked, '••••@upi')
})
