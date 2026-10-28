import { partCategories, type PartCategory } from '../data/parts.ts'

export const sellPartTypes = partCategories

export const sellConditions = [
  'Like New',
  'Good',
  'Fair',
  'For Parts',
] as const
export const sellWorkingStatuses = ['Fully working', 'Partially working', 'Not working', 'Unknown'] as const
export const sellFulfillmentOptions = ['Pickup', 'Drop-off'] as const
export const sellPayoutMethods = ['UPI', 'Bank transfer', 'PayPal'] as const

export type SellCondition = (typeof sellConditions)[number]
export type SellWorkingStatus = (typeof sellWorkingStatuses)[number]
export type SellFulfillment = (typeof sellFulfillmentOptions)[number]
export type SellPayoutMethod = (typeof sellPayoutMethods)[number]

export interface SellOfferRange {
  min: number
  max: number
}

export interface SellRequestSubmission {
  partType: PartCategory
  brand: string
  model: string
  purchaseYear: number
  condition: SellCondition
  workingStatus: SellWorkingStatus
  hasOriginalBox: boolean
  hasInvoice: boolean
  photoNames: string[]
  description: string
  askingPrice: number
  offerRange: SellOfferRange
  sellerName: string
  email: string
  phone: string
  address: string
  fulfillment: SellFulfillment
  payoutMethod: SellPayoutMethod
  payoutDestination: string
}

export interface SellFormValues {
  partType: PartCategory | ''
  brand: string
  model: string
  purchaseYear: string
  condition: SellCondition | ''
  workingStatus: SellWorkingStatus | ''
  hasOriginalBox: boolean
  hasInvoice: boolean
  description: string
  askingPrice: string
  sellerName: string
  email: string
  phone: string
  address: string
  fulfillment: SellFulfillment | ''
  payoutMethod: SellPayoutMethod | ''
  payoutDestination: string
}

export type SellFormErrors = Partial<Record<keyof SellFormValues | 'photos', string>>

export const initialSellFormValues: SellFormValues = {
  partType: '',
  brand: '',
  model: '',
  purchaseYear: '',
  condition: '',
  workingStatus: '',
  hasOriginalBox: false,
  hasInvoice: false,
  description: '',
  askingPrice: '',
  sellerName: '',
  email: '',
  phone: '',
  address: '',
  fulfillment: '',
  payoutMethod: '',
  payoutDestination: '',
}

const conditionMultipliers: Record<SellCondition, SellOfferRange> = {
  'Like New': { min: 0.72, max: 0.88 },
  Good: { min: 0.55, max: 0.72 },
  Fair: { min: 0.35, max: 0.52 },
  'For Parts': { min: 0.1, max: 0.28 },
}

export function getEstimatedOfferRange(
  askingPrice: number,
  condition: SellCondition,
  purchaseYear: number,
  currentYear = new Date().getFullYear(),
): SellOfferRange {
  if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
    throw new RangeError('Asking price must be greater than zero.')
  }
  if (!sellConditions.includes(condition)) {
    throw new RangeError('Choose a valid part condition.')
  }
  if (!Number.isInteger(purchaseYear) || purchaseYear < 1980 || purchaseYear > currentYear) {
    throw new RangeError('Purchase year must be a valid year up to the current year.')
  }

  const ageInYears = currentYear - purchaseYear
  const ageFactor = Math.max(0.45, 1 - Math.max(0, ageInYears - 1) * 0.04)
  const multipliers = conditionMultipliers[condition]
  return {
    min: Math.round(askingPrice * multipliers.min * ageFactor),
    max: Math.round(askingPrice * multipliers.max * ageFactor),
  }
}

export function validateSellStep(
  step: number,
  values: SellFormValues,
  photoCount: number,
  currentYear = new Date().getFullYear(),
): SellFormErrors {
  const errors: SellFormErrors = {}
  const addRequired = (key: keyof SellFormValues, label: string) => {
    if (!values[key].toString().trim()) errors[key] = `${label} is required.`
  }

  if (step === 0) {
    addRequired('partType', 'Part type')
    addRequired('brand', 'Brand')
    addRequired('model', 'Model')
    addRequired('condition', 'Condition')
    addRequired('workingStatus', 'Working status')
    const year = Number(values.purchaseYear)
    if (!values.purchaseYear.trim()) errors.purchaseYear = 'Purchase year is required.'
    else if (!Number.isInteger(year) || year < 1980 || year > currentYear) {
      errors.purchaseYear = `Enter a year from 1980 to ${currentYear}.`
    }
  }

  if (step === 1) {
    if (values.description.trim().length < 10) {
      errors.description = 'Add at least 10 characters describing the part and its condition.'
    }
    if (photoCount > 5) errors.photos = 'You can add up to 5 photos.'
  }

  if (step === 2) {
    const price = Number(values.askingPrice)
    if (!values.askingPrice.trim()) errors.askingPrice = 'Asking price is required.'
    else if (!Number.isFinite(price) || price <= 0 || price > 100000) {
      errors.askingPrice = 'Enter a price greater than 0 and no more than 100,000.'
    }
  }

  if (step === 3) {
    addRequired('sellerName', 'Name')
    addRequired('email', 'Email')
    addRequired('phone', 'Phone')
    addRequired('address', 'Address')
    addRequired('fulfillment', 'Pickup or drop-off choice')
    addRequired('payoutMethod', 'Payout method')
    addRequired('payoutDestination', 'Payout details')
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (values.phone.trim() && !/^[+\d][\d\s().-]{6,19}$/.test(values.phone.trim())) {
      errors.phone = 'Enter a valid phone number.'
    }
    if (values.address.trim() && values.address.trim().length < 8) {
      errors.address = 'Enter a complete street address.'
    }
    if (values.payoutMethod === 'PayPal' && values.payoutDestination.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.payoutDestination.trim())) {
      errors.payoutDestination = 'Enter a valid PayPal email.'
    }
    if (values.payoutMethod === 'UPI' && values.payoutDestination.trim() &&
      !/^[\w.-]+@[\w.-]+$/.test(values.payoutDestination.trim())) {
      errors.payoutDestination = 'Enter a valid UPI ID, for example name@bank.'
    }
  }

  return errors
}

export function maskPayoutDestination(destination: string): string {
  const trimmed = destination.trim()
  if (trimmed.length <= 4) return '••••'
  return `••••${trimmed.slice(-4)}`
}

export function isSellPartType(value: string): value is PartCategory {
  return partCategories.some((category) => category === value)
}

export function isSellCondition(value: string): value is SellCondition {
  return sellConditions.some((condition) => condition === value)
}

export function isSellWorkingStatus(value: string): value is SellWorkingStatus {
  return sellWorkingStatuses.some((status) => status === value)
}

export function isSellFulfillment(value: string): value is SellFulfillment {
  return sellFulfillmentOptions.some((option) => option === value)
}

export function isSellPayoutMethod(value: string): value is SellPayoutMethod {
  return sellPayoutMethods.some((method) => method === value)
}
