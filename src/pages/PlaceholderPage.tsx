import { Link, useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
import { pageDestinations } from '../components/layout/navigation'
import Icon from '../components/layout/Icon'

function PlaceholderPage() {
  const location = useLocation()
  const { pathname } = location
  const destination = pageDestinations.find((page) => page.to === pathname)
  const title = destination?.label ?? titleFromPath(pathname)
  const isHome = pathname === '/'
  const preloadedBuild = getPreloadedBuild(location.state)

  return (
    <Container className="destination-page">
      <p className="destination-page__eyebrow">{isHome ? 'Built for your next level' : 'PCForge · Store'}</p>
      <h1>{isHome ? <>Build something<br />unforgettable.</> : title}</h1>
      <p className="destination-page__description">
        {isHome
          ? 'Your next PC starts here. Explore expertly built systems, premium parts, and the freedom to make it yours.'
          : 'This destination is ready for its dedicated build step. Browse the store or explore build help in the meantime.'}
      </p>
      {pathname === '/customize' && preloadedBuild && (
        <section aria-label={`Preloaded ${preloadedBuild.name} build`} className="customize-preloaded-build">
          <p className="destination-page__eyebrow">YOUR BUILD IS READY TO CUSTOMIZE</p>
          <h2>{preloadedBuild.name}</h2>
          <ul>
            {preloadedBuild.parts.map((part) => <li key={part.category}><strong>{part.category}</strong><span>{part.name}</span></li>)}
          </ul>
        </section>
      )}
      <div className="destination-page__actions">
        <Link className="ui-button ui-button--primary" to="/shop">Explore the shop <Icon name="arrow" /></Link>
        <Link className="ui-button ui-button--outline" to="/customize">Customize a PC</Link>
      </div>
      <div className="destination-page__links" aria-label="Explore PCForge">
        <Link to="/prebuilts"><span>01</span>Shop prebuilt PCs<Icon name="arrow" /></Link>
        <Link to="/parts"><span>02</span>Find your components<Icon name="arrow" /></Link>
        <Link to="/build-help/compatibility-guide"><span>03</span>Get build help<Icon name="arrow" /></Link>
      </div>
    </Container>
  )
}

interface PreloadedBuild {
  name: string
  parts: Array<{ category: string; name: string }>
}

function getPreloadedBuild(state: unknown): PreloadedBuild | null {
  if (!state || typeof state !== 'object' || !('preloadedBuild' in state)) return null
  const value = state.preloadedBuild
  if (!value || typeof value !== 'object' || !('name' in value) || !('parts' in value)) return null
  if (typeof value.name !== 'string' || !Array.isArray(value.parts)) return null
  const parts = value.parts.filter((part): part is { category: string; name: string } =>
    Boolean(
      part &&
      typeof part === 'object' &&
      'category' in part &&
      'name' in part &&
      typeof part.category === 'string' &&
      typeof part.name === 'string',
    ),
  )
  return { name: value.name, parts }
}

function titleFromPath(pathname: string): string {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((word) => word.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(' / ') || 'Home'
}

export default PlaceholderPage
