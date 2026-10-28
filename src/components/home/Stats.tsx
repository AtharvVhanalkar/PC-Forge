const stats = [
  { value: 12000, suffix: '+', label: 'PCs built', formattedValue: '12,000+' },
  { value: 58000, suffix: '+', label: 'Parts shipped', formattedValue: '58,000+' },
  { value: 9800, suffix: '+', label: 'Happy customers', formattedValue: '9,800+' },
]

function Stats() {
  const reducedMotion = useReducedMotion()

  return (
    <section aria-label="PCForge at a glance" className="home-stats">
      <div className="home-stats__inner container home-reveal-group">
        {stats.map((stat, index) => (
          <div className="home-stat home-reveal-child" data-stat-value={stat.value} key={stat.label}>
            <span className="home-stat__index">0{index + 1}</span>
            <strong aria-label={stat.formattedValue} className="home-stat__value">
              <span data-stat-number>
                {reducedMotion ? stat.value.toLocaleString() : '0'}
              </span>{stat.suffix}
            </strong>
            <span className="home-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats
import { useReducedMotion } from 'motion/react'
