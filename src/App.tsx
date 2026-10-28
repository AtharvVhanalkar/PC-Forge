import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { pageDestinations } from './components/layout/navigation'
import { partCategories } from './data/parts'
import PlaceholderPage from './pages/PlaceholderPage'
import PageSkeleton from './components/ui/PageSkeleton'

const Home = lazy(() => import('./pages/Home'))
const PartDetail = lazy(() => import('./pages/PartDetail'))
const Parts = lazy(() => import('./pages/Parts'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Customize = lazy(() => import('./pages/Customize'))
const PrebuiltDetail = lazy(() => import('./pages/PrebuiltDetail'))
const Prebuilts = lazy(() => import('./pages/Prebuilts'))
const Shop = lazy(() => import('./pages/Shop'))
const Styleguide = lazy(() => import('./pages/Styleguide'))
const SellParts = lazy(() => import('./pages/SellParts'))
const BuildHelp = lazy(() => import('./pages/BuildHelp'))
const Support = lazy(() => import('./pages/Support'))
const FAQ = lazy(() => import('./pages/Support').then((module) => ({ default: module.FAQ })))
const Warranty = lazy(() => import('./pages/Support').then((module) => ({ default: module.Warranty })))
const Account = lazy(() => import('./pages/Account'))
const AuthPage = lazy(() => import('./pages/Account').then((module) => ({ default: module.AuthPage })))
const Legal = lazy(() => import('./pages/Legal'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetailRoute = lazy(() => import('./pages/Orders').then((module) => ({ default: module.OrderDetailRoute })))
const OrderTracking = lazy(() => import('./pages/Orders').then((module) => ({ default: module.OrderTracking })))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))

function withPageFallback(element: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={withPageFallback(<Home />)} />
          {pageDestinations
            .filter((destination) => {
              const pathname = destination.to.split('?')[0] ?? destination.to
              return ![
                '/', '/shop', '/prebuilts', '/parts', '/customize', '/cart',
                '/checkout', '/sell-parts', '/support', '/faq', '/warranty',
                '/track-order', '/account', '/login', '/register', '/outlet',
                '/workstations', '/monthly-drops', '/privacy', '/terms',
              ].includes(pathname) &&
              !pathname.startsWith('/parts/') &&
              !pathname.startsWith('/build-help/') &&
              !pathname.startsWith('/support/')
            })
            .map((destination) => (
              <Route
                element={withPageFallback(destination.to === '/styleguide' ? <Styleguide /> : <PlaceholderPage />)}
                key={destination.to}
                path={destination.to.slice(1)}
              />
            ))}
          <Route element={withPageFallback(<Shop />)} path="shop" />
          <Route element={<Navigate replace to="/prebuilts?useCase=Workstation" />} path="workstations" />
          <Route element={<Navigate replace to="/prebuilts?useCase=Monthly+Drop" />} path="monthly-drops" />
          <Route element={<Navigate replace to="/parts?outlet=1" />} path="outlet" />
          <Route element={withPageFallback(<Prebuilts />)} path="prebuilts" />
          <Route element={withPageFallback(<PrebuiltDetail />)} path="prebuilts/:id" />
          <Route element={withPageFallback(<Parts />)} path="parts" />
          <Route element={withPageFallback(<PartsRoute />)} path="parts/:id" />
          <Route element={<PlaceholderPage />} path="parts/:category/:partId" />
          <Route element={withPageFallback(<Customize />)} path="customize" />
          <Route element={withPageFallback(<Cart />)} path="cart" />
          <Route element={withPageFallback(<Checkout />)} path="checkout" />
          <Route element={withPageFallback(<OrderConfirmation />)} path="order-confirmation/:id" />
          <Route element={withPageFallback(<SellParts />)} path="sell-parts/*" />
          <Route element={withPageFallback(<Orders />)} path="orders" />
          <Route element={withPageFallback(<OrderDetailRoute />)} path="orders/:id" />
          <Route element={withPageFallback(<OrderTracking />)} path="track-order" />
          <Route element={withPageFallback(<BuildHelp />)} path="build-help/*" />
          <Route element={withPageFallback(<Support />)} path="support" />
          <Route element={withPageFallback(<FAQ />)} path="faq" />
          <Route element={withPageFallback(<FAQ />)} path="support/faq-shipping" />
          <Route element={withPageFallback(<Warranty />)} path="warranty" />
          <Route element={withPageFallback(<Warranty />)} path="support/warranty-returns" />
          <Route element={withPageFallback(<Account />)} path="account" />
          <Route element={withPageFallback(<AuthPage />)} path="login" />
          <Route element={withPageFallback(<AuthPage />)} path="register" />
          <Route element={withPageFallback(<Legal />)} path="privacy" />
          <Route element={withPageFallback(<Legal />)} path="terms" />
          <Route element={<NotFound />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function PartsRoute() {
  const { id } = useParams()
  const category = partCategories.find(
    (partCategory) => partCategory.toLowerCase().replaceAll(' ', '-') === id?.toLowerCase(),
  )

  if (category) return <Parts key={category} initialCategory={category} />
  return <PartDetail />
}

function NotFound() {
  return (
    <div className="not-found-page">
      <p className="destination-page__eyebrow">404 · Page not found</p>
      <h1>This page<br />is off the grid.</h1>
      <p>That link doesn’t lead to a PCForge destination.</p>
      <Link className="ui-button ui-button--primary" to="/">Back to home</Link>
    </div>
  )
}

export default App
