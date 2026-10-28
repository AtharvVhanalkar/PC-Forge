/// <reference types="node" />

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  isValidCardExpiry,
  isValidCardNumber,
} from './checkout.ts'

test('identifies and formats supported mock card brands', () => {
  assert.equal(detectCardBrand('4111111111111111'), 'Visa')
  assert.equal(detectCardBrand('5555555555554444'), 'Mastercard')
  assert.equal(detectCardBrand('378282246310005'), 'American Express')
  assert.equal(detectCardBrand('6011111111111117'), 'Discover')
  assert.equal(formatCardNumber('4111-1111 1111 1111'), '4111 1111 1111 1111')
  assert.equal(formatCardNumber('378282246310005'), '3782 822463 10005')
  assert.equal(formatCardExpiry('1228'), '12/28')
})

test('validates card numbers with the Luhn checksum', () => {
  assert.equal(isValidCardNumber('4111 1111 1111 1111'), true)
  assert.equal(isValidCardNumber('4111 1111 1111 1112'), false)
  assert.equal(isValidCardNumber('123'), false)
})

test('accepts an unexpired month and rejects invalid or expired dates', () => {
  const referenceDate = new Date(2026, 9, 28)
  assert.equal(isValidCardExpiry('10/26', referenceDate), true)
  assert.equal(isValidCardExpiry('11/26', referenceDate), true)
  assert.equal(isValidCardExpiry('09/26', referenceDate), false)
  assert.equal(isValidCardExpiry('13/28', referenceDate), false)
})
