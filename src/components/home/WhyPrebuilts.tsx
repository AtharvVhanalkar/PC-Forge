const pillars = [
  {
    number: '01',
    title: 'Convenience',
    copy: 'A complete build, ready to go. Skip the research rabbit hole and get straight to what you love.',
    icon: (
      <>
        <path d="M12 3.5 20 7v5.3c0 4.2-3.1 7.3-8 9.2-4.9-1.9-8-5-8-9.2V7z" />
        <path d="m8.5 12 2.2 2.2 4.9-5" />
      </>
    ),
  },
  {
    number: '02',
    title: 'Precision',
    copy: 'Every component is chosen to work together, tested under load, and tuned for the real world.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.3" />
        <path d="M12 2v3M22 12h-3M12 22v-3M2 12h3" />
      </>
    ),
  },
  {
    number: '03',
    title: 'Aesthetics',
    copy: 'Clean cable runs, considered details, and builds worth showing off before you even power on.',
    icon: (
      <>
        <path d="M12 3 14.8 9.2 21.5 10l-4.9 4.5 1.3 6.5L12 17.7l-5.9 3.3 1.3-6.5L2.5 10l6.7-.8z" />
        <path d="M19.5 3.5v3M18 5h3M5 17v2M4 18h2" />
      </>
    ),
  },
]

function WhyPrebuilts() {
  return (
    <section aria-labelledby="why-prebuilt-heading" className="why-prebuilts home-section container">
      <div className="home-section-heading home-section-heading--center home-reveal">
        <p className="home-section-heading__eyebrow">NOT JUST A BOX</p>
        <h2 id="why-prebuilt-heading">The PCForge difference.</h2>
        <p>Good hardware is only the beginning. We bring the details together.</p>
      </div>
      <div className="why-prebuilts__grid home-reveal-group">
        {pillars.map((pillar) => (
          <article className="pillar-card home-reveal-child" key={pillar.number}>
            <div className="pillar-card__top">
              <span>{pillar.number}</span>
              <svg
                aria-hidden="true"
                className="pillar-card__icon"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.25"
                viewBox="0 0 24 24"
              >
                {pillar.icon}
              </svg>
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.copy}</p>
            <span className="pillar-card__rule" />
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyPrebuilts
