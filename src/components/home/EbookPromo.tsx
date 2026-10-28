import { currencyFormatter } from '../../config'
import { firstPcGamerEbook } from '../../data/ebook'
import AddToCartButton from '../shop/AddToCartButton'

function EbookPromo() {
  return (
    <section aria-labelledby="ebook-heading" className="ebook-promo home-section container home-reveal">
      <div className="ebook-promo__art">
        <div aria-hidden="true" className="ebook-cover">
          <span className="ebook-cover__brand">PCFORGE FIELD GUIDE · 001</span>
          <span className="ebook-cover__title">Your first<br /><em>PC build.</em></span>
          <span className="ebook-cover__mark">BUILD WITH CONFIDENCE</span>
          <span aria-hidden="true" className="ebook-cover__graphic">
            <i /><i /><i /><i /><i /><i />
          </span>
        </div>
        <span aria-hidden="true" className="ebook-promo__spark ebook-promo__spark--one">✳</span>
        <span aria-hidden="true" className="ebook-promo__spark ebook-promo__spark--two">✳</span>
      </div>
      <div className="ebook-promo__copy">
        <p className="home-section-heading__eyebrow">YOUR FIRST PC, MADE SIMPLE</p>
        <h2 id="ebook-heading">First time<br />PC gamer?</h2>
        <p>A friendly field guide to choosing parts, checking compatibility, and building a PC you’ll be proud of.</p>
        <ul>
          <li>Understand every core component</li>
          <li>Choose parts that work together</li>
          <li>Follow a clear, beginner-friendly build flow</li>
        </ul>
        <AddToCartButton
          className="ui-button ui-button--primary"
          item={firstPcGamerEbook}
          label="Shop eBook"
          arrow
        />
        <span className="ebook-promo__price">{currencyFormatter.format(firstPcGamerEbook.price)} · INSTANT DIGITAL ACCESS</span>
      </div>
    </section>
  )
}

export default EbookPromo
