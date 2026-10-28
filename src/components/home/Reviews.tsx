import { useState } from 'react'

const reviews = [
  {
    name: 'Jordan M.',
    descriptor: 'SCARLET FURY OWNER',
    quote: 'First game to boot was completely silent. Cable management is immaculate. This thing is an absolute beast.',
  },
  {
    name: 'Priya K.',
    descriptor: 'FROST NOVA OWNER',
    quote: 'The build looks even better in person. Setup was painless and my games have never looked this good.',
  },
  {
    name: 'Alex R.',
    descriptor: 'CUSTOM BUILD OWNER',
    quote: 'The compatibility guidance made my first build feel easy. Every part arrived ready to go.',
  },
]

function Reviews() {
  const [paused, setPaused] = useState(false)

  return (
    <section aria-labelledby="home-reviews-heading" className="home-reviews home-section">
      <div className="container">
        <div className="home-section-heading home-section-heading--center home-reveal">
          <p className="home-section-heading__eyebrow">DON’T JUST TAKE OUR WORD</p>
          <h2 id="home-reviews-heading">Built right. Loved out loud.</h2>
        </div>
      </div>
      <div
        className={`reviews-marquee${paused ? ' reviews-marquee--paused' : ''}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
        }}
        onFocus={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="reviews-marquee__track">
          {[...reviews, ...reviews].map((review, index) => (
            <figure
              aria-hidden={index >= reviews.length}
              className="review-card"
              key={`${review.name}-${index}`}
            >
              <div aria-label="5 out of 5 stars" className="review-card__stars">★★★★★</div>
              <blockquote>“{review.quote}”</blockquote>
              <figcaption>
                <span className="review-card__avatar">{review.name.slice(0, 1)}</span>
                <span><strong>{review.name}</strong><small>{review.descriptor}</small></span>
                <span aria-label="Verified purchase" className="review-card__verified">✓</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <p className="home-reviews__note">A FEW WORDS FROM OUR BUILDER COMMUNITY</p>
    </section>
  )
}

export default Reviews
