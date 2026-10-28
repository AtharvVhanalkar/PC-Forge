import { Link } from 'react-router-dom'
import Icon from '../layout/Icon'
import LazyImage from '../ui/LazyImage'

const categories = [
  {
    number: '01',
    title: 'Gaming PC',
    label: 'PREBUILTS',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
    href: '/prebuilts',
    className: 'category-tile--gaming',
  },
  {
    number: '02',
    title: 'Workstations',
    label: 'POWER THROUGH',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
    href: '/workstations',
    className: 'category-tile--workstation',
  },
  {
    number: '03',
    title: 'Outlet',
    label: 'LAST CHANCE',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704',
    href: '/outlet',
    className: 'category-tile--outlet',
  },
  {
    number: '04',
    title: 'Monthly Drops',
    label: 'LIMITED RUN',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
    href: '/monthly-drops',
    className: 'category-tile--drops',
  },
]

function CategoryTiles() {
  return (
    <section aria-labelledby="home-categories-heading" className="home-categories home-section container" id="home-categories">
      <div className="home-section-heading home-reveal">
        <p className="home-section-heading__eyebrow">FIND YOUR NEXT RIG</p>
        <h2 id="home-categories-heading">Built for every kind of power.</h2>
      </div>
      <div className="home-categories__grid home-reveal-group">
        {categories.map((category) => (
          <Link
            className={`category-tile home-reveal-child ${category.className}`}
            key={category.number}
            to={category.href}
          >
            <LazyImage alt="" data-image-reveal height="720" loading="lazy" src={category.image} width="960" />
            <span className="category-tile__shade" />
            <span className="category-tile__number">{category.number}</span>
            <span className="category-tile__content">
              <span className="category-tile__label">{category.label}</span>
              <span className="category-tile__title">{category.title}</span>
            </span>
            <span aria-hidden="true" className="category-tile__arrow"><Icon name="arrow" /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategoryTiles
