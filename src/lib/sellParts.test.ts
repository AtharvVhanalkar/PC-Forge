import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getEstimatedOfferRange,
  initialSellFormValues,
  validateSellStep,
} from './sellParts.ts'

test('estimates an offer from asking price, condition, and purchase year', () => {
  assert.deepEqual(getEstimatedOfferRange(1000, 'Like New', 2026, 2026), {
    min: 720,
    max: 880,
  })
  assert.deepEqual(getEstimatedOfferRange(1000, 'Fair', 2022, 2026), {
    min: 308,
    max: 458,
  })
  assert.deepEqual(getEstimatedOfferRange(1000, 'For Parts', 2000, 2026), {
    min: 45,
    max: 126,
  })
})

test('validates part details, photo count, asking price, and seller contact inline', () => {
  assert.deepEqual(Object.keys(validateSellStep(0, initialSellFormValues, 0)).sort(), [
    'brand',
    'condition',
    'model',
    'partType',
    'purchaseYear',
    'workingStatus',
  ])
  assert.equal(validateSellStep(1, { ...initialSellFormValues, description: 'Short' }, 6).photos, 'You can add up to 5 photos.')
  assert.ok(validateSellStep(2, { ...initialSellFormValues, askingPrice: '-1' }, 0).askingPrice)
  assert.ok(validateSellStep(3, { ...initialSellFormValues, email: 'invalid' }, 0).email)
  assert.ok(validateSellStep(0, { ...initialSellFormValues, purchaseYear: '2030' }, 0, 2026).purchaseYear)
  assert.ok(validateSellStep(0, initialSellFormValues, 0).workingStatus)
  assert.ok(validateSellStep(1, { ...initialSellFormValues, description: 'ok' }, 0).description)
  assert.ok(validateSellStep(2, { ...initialSellFormValues, askingPrice: '100001' }, 0).askingPrice)
})

test('validates payout values based on the selected mock payment method', () => {
  const base = {
    ...initialSellFormValues,
    sellerName: 'Casey Seller',
    email: 'casey@example.com',
    phone: '5550101234',
    address: '42 Test Street, Portland',
    fulfillment: 'Pickup' as const,
  }
  assert.equal(
    validateSellStep(3, { ...base, payoutMethod: 'UPI', payoutDestination: 'invalid' }, 0).payoutDestination,
    'Enter a valid UPI ID, for example name@bank.',
  )
  assert.equal(
    validateSellStep(3, { ...base, payoutMethod: 'PayPal', payoutDestination: 'not-an-email' }, 0).payoutDestination,
    'Enter a valid PayPal email.',
  )
  assert.ok(validateSellStep(3, { ...base, phone: '12', payoutMethod: 'Bank transfer', payoutDestination: '' }, 0).phone)
  assert.ok(validateSellStep(3, { ...base, address: 'Home', payoutMethod: 'Bank transfer', payoutDestination: 'Local bank' }, 0).address)
  assert.ok(validateSellStep(3, { ...base, fulfillment: '', payoutMethod: 'Bank transfer', payoutDestination: 'Local bank' }, 0).fulfillment)
  assert.ok(validateSellStep(3, { ...base, payoutMethod: '', payoutDestination: 'Local bank' }, 0).payoutMethod)
  assert.deepEqual(
    validateSellStep(3, { ...base, payoutMethod: 'Bank transfer', payoutDestination: 'Local bank •••• 42' }, 0),
    {},
  )
})

test('rejects invalid estimated offer inputs', () => {
  assert.throws(() => getEstimatedOfferRange(0, 'Good', 2026), RangeError)
  assert.throws(() => getEstimatedOfferRange(100, 'Good', 2027, 2026), RangeError)
})
