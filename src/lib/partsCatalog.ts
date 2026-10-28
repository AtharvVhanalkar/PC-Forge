import type { Part, PartCategory } from '../data/parts'

export type PartSortOrder = 'featured' | 'price-low' | 'price-high' | 'rating'

export interface PartFilters {
  category: PartCategory | null
  brand: string
  minimum: number
  maximum: number
  specValue: string
  inStockOnly: boolean
  search: string
  sort: PartSortOrder
}

export interface PartFacet {
  label: string
  value: string
}

const FACET_LABELS: Partial<Record<PartCategory, string>> = {
  CPU: 'Socket',
  GPU: 'VRAM',
  Motherboard: 'CPU socket',
  RAM: 'Memory type',
  Storage: 'Capacity',
  PSU: 'Wattage',
  Cooling: 'Cooler type',
  Fans: 'Fan size',
  Monitors: 'Resolution',
  Peripherals: 'Type',
}

export function getPartPrice(part: Part): number {
  return part.outlet && part.discountedPrice !== undefined
    ? part.discountedPrice
    : part.price
}

export function getPartFacet(part: Part): PartFacet | null {
  const label = FACET_LABELS[part.category]
  if (!label) return null

  if (part.category === 'CPU' || part.category === 'Motherboard') {
    const socket = part.compatibility.cpuSocket ?? part.specs.socket
    return socket ? { label, value: String(socket) } : null
  }

  if (part.category === 'GPU') {
    const memory = String(part.specs.memory ?? '')
    const capacity = memory.match(/^(\d+(?:\.\d+)?)\s*GB/i)?.[1]
    return capacity ? { label, value: `${capacity} GB` } : null
  }

  if (part.category === 'RAM') {
    const memoryType = part.compatibility.ramType
    return memoryType ? { label, value: memoryType } : null
  }

  const specByCategory: Partial<Record<PartCategory, string>> = {
    Storage: 'capacity',
    PSU: 'wattage',
    Cooling: 'type',
    Fans: 'size',
    Monitors: 'resolution',
    Peripherals: 'type',
  }
  const spec = specByCategory[part.category]
  const value = spec ? part.specs[spec] : undefined

  if (value === undefined) return null
  return {
    label,
    value: part.category === 'PSU' ? `${value}W` : String(value),
  }
}

export function filterParts(products: readonly Part[], filters: PartFilters): Part[] {
  const query = filters.search.trim().toLocaleLowerCase()
  const results = products.filter((part) => {
    if (filters.category && part.category !== filters.category) return false
    if (filters.brand && part.brand !== filters.brand) return false
    if (filters.inStockOnly && part.stock !== 'in-stock') return false

    const price = getPartPrice(part)
    if (price < filters.minimum || price > filters.maximum) return false

    if (filters.specValue && getPartFacet(part)?.value !== filters.specValue) return false

    if (query) {
      const searchable = [
        part.brand,
        part.name,
        part.category,
        ...Object.values(part.specs).map(String),
      ].join(' ').toLocaleLowerCase()
      if (!searchable.includes(query)) return false
    }

    return true
  })

  return results.sort((first, second) => {
    if (filters.sort === 'price-low') return getPartPrice(first) - getPartPrice(second)
    if (filters.sort === 'price-high') return getPartPrice(second) - getPartPrice(first)
    if (filters.sort === 'rating' || filters.sort === 'featured') {
      return second.rating - first.rating || first.name.localeCompare(second.name)
    }
    return 0
  })
}
