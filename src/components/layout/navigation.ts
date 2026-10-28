import { partCategories } from '../../data/parts'

export interface NavigationLink {
  label: string
  to: string
}

export interface NavigationGroup {
  label: string
  links: NavigationLink[]
}

export const shopLinks: NavigationLink[] = [
  { label: 'Prebuilt PCs', to: '/prebuilts' },
  { label: 'Workstations', to: '/prebuilts?useCase=Workstation' },
  { label: 'Monthly Drops', to: '/prebuilts?useCase=Monthly+Drop' },
  { label: 'Outlet', to: '/outlet' },
  { label: 'All Parts', to: '/parts' },
]

export const buildHelpLinks: NavigationLink[] = [
  { label: 'Component Quick Picks', to: '/build-help/component-quick-picks' },
  { label: 'GPU Comparison Chart', to: '/build-help/gpu-comparison' },
  { label: 'PSU Quick Picks', to: '/build-help/psu-quick-picks' },
  { label: 'Compatibility Guide', to: '/build-help/compatibility-guide' },
  { label: 'PC Price Watch', to: '/build-help/price-watch' },
]

export const supportLinks: NavigationLink[] = [
  { label: 'Customer Support', to: '/support' },
  { label: 'FAQ & Shipping', to: '/faq' },
  { label: 'Warranty & Returns', to: '/warranty' },
  { label: 'Track Order', to: '/track-order' },
]

export const shopGroups: NavigationGroup[] = [
  { label: 'Explore', links: shopLinks },
  {
    label: 'Shop by component',
    links: partCategories.map((category) => ({
      label: category,
      to: `/parts/${category.toLowerCase().replaceAll(' ', '-')}`,
    })),
  },
]

export const pageDestinations: NavigationLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  ...shopLinks,
  ...shopGroups[1].links,
  { label: 'Customize PC', to: '/customize' },
  ...buildHelpLinks,
  { label: 'Sell Parts', to: '/sell-parts' },
  ...supportLinks,
  { label: 'Account', to: '/account' },
  { label: 'Cart', to: '/cart' },
  { label: 'Checkout', to: '/checkout' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Styleguide', to: '/styleguide' },
]
