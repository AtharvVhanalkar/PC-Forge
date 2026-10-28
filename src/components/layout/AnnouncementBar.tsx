import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { config, currencyFormatter } from '../../config'
import Icon from './Icon'

const messages = [
  '0% EMI available on select builds',
  `Free shipping on orders over ${currencyFormatter.format(config.freeShippingThreshold)}`,
  'Read what builders are saying about us',
]

function AnnouncementBar() {
  const [activeMessage, setActiveMessage] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (paused || reducedMotion) return

    const intervalId = window.setInterval(() => {
      setActiveMessage((current) => (current + 1) % messages.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [paused, reducedMotion])

  return (
    <div className="announcement-bar" aria-label="Store announcements">
      <div className="announcement-bar__message" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeMessage}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
          >
            {messages[activeMessage]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="announcement-bar__controls" aria-label="Announcement controls">
        {messages.map((message, index) => (
          <button
            aria-label={`Show announcement ${index + 1}: ${message}`}
            aria-pressed={activeMessage === index}
            className="announcement-bar__dot"
            key={message}
            onClick={() => setActiveMessage(index)}
            type="button"
          />
        ))}
        <button
          aria-label={paused ? 'Play announcements' : 'Pause announcements'}
          className="announcement-bar__toggle"
          onClick={() => setPaused((current) => !current)}
          type="button"
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBar
