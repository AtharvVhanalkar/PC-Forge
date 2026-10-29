import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Icon from '../components/layout/Icon'
import LazyImage from '../components/ui/LazyImage'

const categories = [
  {
    title: 'Prebuilt PCs',
    description: 'Dialed-in systems, tested and ready for your next level.',
    label: 'FIND YOUR RIG',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=960&q=80',
    to: '/prebuilts',
    className: 'shop-category--prebuilt',
  },
  {
    title: 'Gaming PCs',
    description: 'High-refresh performance for your favorite worlds.',
    label: 'PLAY WITHOUT LIMITS',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=960&q=80',
    to: '/prebuilts?useCase=Gaming',
    className: 'shop-category--gaming',
  },
  {
    title: 'Workstations',
    description: 'Serious compute for creative work and demanding pipelines.',
    label: 'MAKE MORE HAPPEN',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=960&q=80',
    to: '/prebuilts?useCase=Workstation',
    className: 'shop-category--workstation',
  },
  {
    title: 'Monthly Drops',
    description: 'Limited-run builds with a little extra personality.',
    label: 'HERE FOR A GOOD TIME',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=960&q=80',
    to: '/prebuilts?useCase=Monthly+Drop',
    className: 'shop-category--drops',
  },
  {
    title: 'PC Parts',
    description: 'Build from the ground up with gear that fits together.',
    label: 'PICK EVERY PART',
    image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=960&q=80',
    to: '/parts',
    className: 'shop-category--parts',
  },
  {
    title: 'Outlet',
    description: 'A second chance at great gear, at a better price.',
    label: 'LAST CHANCE',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=960&q=80',
    to: '/outlet',
    className: 'shop-category--outlet',
  },
]

function Shop() {
  return (
    <div className="shop-landing">
      <Container className="shop-landing__intro">
        <p className="destination-page__eyebrow">THE PCFORGE STORE</p>
        <h1>Find your<br /><span>next build.</span></h1>
        <p>Purpose-built PCs, thoughtfully chosen parts, and the tools to make your setup yours.</p>
        <Link className="ui-button ui-button--primary" to="/prebuilts">
          Explore Prebuilt PCs <Icon name="arrow" />
        </Link>
      </Container>
      <section aria-label="Shop PCForge categories" className="shop-categories container">
        {categories.map((category, index) => (
          <Link className={`shop-category ${category.className}`} key={category.title} to={category.to}>
            <LazyImage alt="" height="720" loading={index < 2 ? 'eager' : 'lazy'} src={category.image} width="960" />
            <span className="shop-category__shade" />
            <span className="shop-category__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="shop-category__content">
              <span className="shop-category__label">{category.label}</span>
              <strong>{category.title}</strong>
              <span className="shop-category__description">{category.description}</span>
            </span>
            <span aria-hidden="true" className="shop-category__arrow"><Icon name="arrow" /></span>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default Shop
