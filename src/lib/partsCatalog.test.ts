import assert from 'node:assert/strict'
import test from 'node:test'
import { parts } from '../data/parts.ts'
import { filterParts, getPartFacet, getPartPrice, type PartFilters } from './partsCatalog.ts'

function createFilters(overrides: Partial<PartFilters> = {}): PartFilters {
  return {
    category: null,
    brand: '',
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
    specValue: '',
    inStockOnly: false,
    search: '',
    sort: 'featured',
    ...overrides,
  }
}

test('combines category, brand, price, socket, stock, and search filters', () => {
  const filtered = filterParts(parts, createFilters({
    category: 'CPU',
    brand: 'AMD',
    minimum: 300,
    maximum: 500,
    specValue: 'AM5',
    inStockOnly: true,
    search: 'Ryzen 7',
  }))

  assert.deepEqual(filtered.map((part) => part.id), [
    'cpu-ryzen-7-9800x3d',
    'cpu-ryzen-7-9700x',
  ])
})

test('uses category-specific facets to filter graphics card VRAM', () => {
  const filtered = filterParts(parts, createFilters({
    category: 'GPU',
    brand: 'ASUS',
    minimum: 800,
    maximum: 1500,
    specValue: '16 GB',
    inStockOnly: true,
    search: 'TUF',
  }))

  assert.deepEqual(filtered.map((part) => part.id), ['gpu-rtx-5080'])
  assert.deepEqual(getPartFacet(filtered[0]), { label: 'VRAM', value: '16 GB' })
})

test('applies outlet price consistently to price filters and price sorting', () => {
  const outletCpu = parts.find((part) => part.id === 'cpu-ryzen-5-9600x')
  assert.ok(outletCpu)
  assert.equal(getPartPrice(outletCpu), 219)

  const filtered = filterParts(parts, createFilters({
    category: 'CPU',
    minimum: 215,
    maximum: 220,
    sort: 'price-low',
  }))
  assert.deepEqual(filtered.map((part) => part.id), ['cpu-ryzen-5-9600x'])
})

test('in-stock only excludes low-stock and made-to-order products', () => {
  const filtered = filterParts(parts, createFilters({
    category: 'PSU',
    inStockOnly: true,
  }))

  assert.ok(filtered.every((part) => part.stock === 'in-stock'))
  assert.ok(!filtered.some((part) => part.id === 'psu-prime-tx1300'))
})

test('sorts filtered products in both price directions', () => {
  const ascending = filterParts(parts, createFilters({ category: 'GPU', sort: 'price-low' }))
  const descending = filterParts(parts, createFilters({ category: 'GPU', sort: 'price-high' }))

  assert.ok(ascending.every((part, index) => index === 0 || getPartPrice(part) >= getPartPrice(ascending[index - 1])))
  assert.ok(descending.every((part, index) => index === 0 || getPartPrice(part) <= getPartPrice(descending[index - 1])))
})
