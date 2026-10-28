export const config = {
  brandName: 'PCForge',
  currency: 'USD',
  locale: 'en-US',
  freeShippingThreshold: 1000,
} as const

export const currencyFormatter = new Intl.NumberFormat(config.locale, {
  style: 'currency',
  currency: config.currency,
})
