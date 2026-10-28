import type { Part } from '../data/parts.ts'
import type { Prebuilt } from '../data/prebuilts.ts'

export type DeliveryDays = 4 | 6 | 10

export interface CustomBuildDeliveryItem {
  kind: 'custom-build'
  id?: string
  name?: string
}

export type DeliveryItem = (Part | Prebuilt | CustomBuildDeliveryItem) & {
  express?: boolean
}

export interface ItemEta {
  days: DeliveryDays
  arrivalDate: Date
  label: string
}

const LARGE_ITEM_CATEGORIES = new Set(['Case', 'Monitors'])

function isCustomBuild(item: DeliveryItem): item is CustomBuildDeliveryItem {
  return 'kind' in item && item.kind === 'custom-build'
}

function getStockStatus(item: Part | Prebuilt): string {
  return 'stock' in item ? item.stock : item.stockStatus
}

function getItemCategory(item: Part | Prebuilt): string | undefined {
  return 'category' in item ? item.category : undefined
}

function getEtaDays(item: DeliveryItem): DeliveryDays {
  if (isCustomBuild(item)) return 10

  if (
    getStockStatus(item) !== 'in-stock' ||
    LARGE_ITEM_CATEGORIES.has(getItemCategory(item) ?? '')
  ) {
    return 6
  }

  return 4
}

function addDaysSkippingSundays(date: Date, days: DeliveryDays): Date {
  const arrivalDate = new Date(date)
  arrivalDate.setHours(12, 0, 0, 0)

  let countedDays = 0
  while (countedDays < days) {
    arrivalDate.setDate(arrivalDate.getDate() + 1)
    if (arrivalDate.getDay() !== 0) countedDays += 1
  }

  return arrivalDate
}

export function formatDeliveryDate(
  date: Date,
  weekdaySeparator: ',' | '' = ',',
): string {
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(date)
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date)
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date)

  return `${weekday}${weekdaySeparator} ${day} ${month}`.trim()
}

export function getItemEta(item: DeliveryItem, referenceDate = new Date()): ItemEta {
  const days = getEtaDays(item)
  const arrivalDate = addDaysSkippingSundays(referenceDate, days)

  return {
    days,
    arrivalDate,
    label: `Arrives by ${formatDeliveryDate(arrivalDate)}`,
  }
}

export function getCartEta(
  items: readonly DeliveryItem[],
  referenceDate = new Date(),
): ItemEta {
  if (items.length === 0) {
    throw new RangeError('Cannot estimate delivery for an empty cart.')
  }

  const days = items.reduce<DeliveryDays>(
    (longest, item) => {
      const itemDays = getEtaDays(item)
      return itemDays > longest ? itemDays : longest
    },
    4,
  )
  const arrivalDate = addDaysSkippingSundays(referenceDate, days)

  return {
    days,
    arrivalDate,
    label: `Arrives by ${formatDeliveryDate(arrivalDate)}`,
  }
}
