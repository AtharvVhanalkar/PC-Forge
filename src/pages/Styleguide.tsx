import { useState } from 'react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Checkbox from '../components/ui/Checkbox'
import Container from '../components/ui/Container'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import SectionHeading from '../components/ui/SectionHeading'
import Select from '../components/ui/Select'
import Skeleton from '../components/ui/Skeleton'
import Toast, { type ToastVariant } from '../components/ui/Toast'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import { parts } from '../data/parts'
import { prebuilts } from '../data/prebuilts'

function getPartById(id: string) {
  const part = parts.find((item) => item.id === id)
  if (!part) throw new Error(`Missing styleguide part: ${id}`)
  return part
}

function getPrebuiltById(id: string) {
  const prebuilt = prebuilts.find((item) => item.id === id)
  if (!prebuilt) throw new Error(`Missing styleguide prebuilt: ${id}`)
  return prebuilt
}

const colors = [
  ['Background', '#0f0f10'],
  ['Surface', '#171717'],
  ['Surface 2', '#1f1f21'],
  ['Border', '#2a2a2d'],
  ['Text', '#f5f5f5'],
  ['Muted', '#a1a1aa'],
  ['Accent', '#e11d2e'],
  ['Accent hover', '#ff2d3f'],
  ['Success', '#22c55e'],
  ['Warning', '#f59e0b'],
]

function Styleguide() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: ToastVariant
  } | null>(null)

  function showToast(variant: ToastVariant) {
    const messages: Record<ToastVariant, string> = {
      success: 'Your changes have been saved.',
      warning: 'Please review this before continuing.',
      error: 'Something went wrong. Try again.',
    }
    setToast({ message: messages[variant], variant })
  }

  return (
    <Container className="styleguide">
      <header className="styleguide__hero">
        <Badge variant="danger">PCForge · UI foundations</Badge>
        <h1>Built for the next level.</h1>
        <p>
          A reusable component and theme reference for PCForge. Interactive
          controls below demonstrate their available states.
        </p>
      </header>

      <section className="styleguide__section" aria-labelledby="tokens-heading">
        <SectionHeading
          title="Theme tokens"
          eyebrow="01 / Foundation"
          description="Dark surfaces, high-contrast type, and red accents define the visual system."
        />
        <div className="styleguide__swatches" id="tokens-heading">
          {colors.map(([name, color]) => (
            <div className="styleguide__swatch" key={name}>
              <span
                className="styleguide__swatch-color"
                style={{ backgroundColor: color }}
              />
              <span>{name}</span>
              <code>{color}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="buttons-heading">
        <SectionHeading
          title="Buttons"
          eyebrow="02 / Actions"
          description="Primary, outline, ghost, loading, and disabled states; hover and press interactions are enabled."
        />
        <div className="styleguide__row" id="buttons-heading">
          <Button>Primary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="badges-heading">
        <SectionHeading title="Badges" eyebrow="03 / Status" />
        <div className="styleguide__row" id="badges-heading">
          <Badge>In stock</Badge>
          <Badge variant="success">Available</Badge>
          <Badge variant="warning">Low stock</Badge>
          <Badge variant="danger">Sale</Badge>
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="cards-heading">
        <SectionHeading
          title="Cards"
          eyebrow="04 / Surfaces"
          description="Hover to preview the red-tinted border and soft elevation."
        />
        <div className="styleguide__grid" id="cards-heading">
          <Card>
            <div className="styleguide__stack">
              <Badge variant="success">In stock</Badge>
              <h3>Performance builds</h3>
              <p>Purpose-built components for smooth, high-frame-rate gaming.</p>
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <Badge variant="warning">Popular</Badge>
              <h3>Custom configurations</h3>
              <p>Choose your components and make the build your own.</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="fields-heading">
        <SectionHeading
          title="Form controls"
          eyebrow="05 / Input"
          description="Labels, hints, validation, and native keyboard interaction are included."
        />
        <div className="styleguide__grid" id="fields-heading">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            hint="We'll only use this for order updates."
          />
          <Input
            label="Invalid input example"
            defaultValue="not-an-email"
            error="Enter a valid email address."
          />
          <Select label="Build preference" defaultValue="gaming">
            <option value="gaming">Gaming</option>
            <option value="workstation">Workstation</option>
            <option value="streaming">Streaming</option>
          </Select>
          <div className="styleguide__stack">
            <Checkbox label="Subscribe to build updates" defaultChecked />
            <Checkbox label="Save this preference" />
          </div>
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="modal-heading">
        <SectionHeading title="Modal" eyebrow="06 / Dialog" />
        <div className="styleguide__row" id="modal-heading">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <span className="ui-field__hint">
            Close with Escape, the close button, or the backdrop.
          </span>
        </div>
        <Modal
          open={modalOpen}
          title="Confirm your build"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Continue</Button>
            </>
          }
        >
          <p>
            Your component selection is ready. You can continue to review your
            configuration.
          </p>
        </Modal>
      </section>

      <section className="styleguide__section" aria-labelledby="toast-heading">
        <SectionHeading
          title="Toast notifications"
          eyebrow="07 / Feedback"
          description="Each toast is announced accessibly and dismisses automatically."
        />
        <div className="styleguide__row" id="toast-heading">
          <Button variant="outline" onClick={() => showToast('success')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => showToast('warning')}>
            Warning toast
          </Button>
          <Button variant="outline" onClick={() => showToast('error')}>
            Error toast
          </Button>
        </div>
        <div className="styleguide__toast-slot" aria-live="polite">
          {toast && (
            <Toast
              key={`${toast.variant}-${toast.message}`}
              message={toast.message}
              variant={toast.variant}
              onDismiss={() => setToast(null)}
            />
          )}
        </div>
      </section>

      <section className="styleguide__section" aria-labelledby="skeleton-heading">
        <SectionHeading
          title="Skeleton loading"
          eyebrow="08 / Loading"
          description="Placeholder shapes for pending content."
        />
        <Card id="skeleton-heading">
          <div className="styleguide__stack">
            <Skeleton width="8rem" height="1rem" />
            <Skeleton width="70%" height="2rem" />
            <Skeleton height="5rem" />
          </div>
        </Card>
      </section>

      <section className="styleguide__section" aria-labelledby="delivery-heading">
        <SectionHeading
          title="Delivery estimates"
          eyebrow="09 / Shipping"
          description="Single part, large-item, made-to-order PC, custom build, and prebuilt delivery estimates."
        />
        <div className="styleguide__grid" id="delivery-heading">
          <Card>
            <div className="styleguide__stack">
              <h3>In-stock part</h3>
              <DeliveryBadge item={getPartById('cpu-ryzen-7-9800x3d')} />
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <h3>Low-stock part</h3>
              <DeliveryBadge item={getPartById('cpu-ryzen-5-9600x')} />
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <h3>Large item</h3>
              <DeliveryBadge item={getPartById('case-north-xl')} />
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <h3>Made-to-order PC</h3>
              <DeliveryBadge item={getPrebuiltById('titan-forge')} />
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <h3>Custom build</h3>
              <DeliveryBadge item={{ kind: 'custom-build', id: 'styleguide-custom-build' }} />
            </div>
          </Card>
          <Card>
            <div className="styleguide__stack">
              <h3>In-stock prebuilt</h3>
              <DeliveryBadge item={getPrebuiltById('scarlet-fury')} />
            </div>
          </Card>
        </div>
      </section>
    </Container>
  )
}

export default Styleguide
