import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'
import { partCategories } from '../data/parts'
import {
  getEstimatedOfferRange,
  isSellCondition,
  isSellFulfillment,
  isSellPayoutMethod,
  isSellPartType,
  isSellWorkingStatus,
  initialSellFormValues,
  sellConditions,
  sellFulfillmentOptions,
  sellPayoutMethods,
  sellWorkingStatuses,
  validateSellStep,
  type SellFormErrors,
  type SellFormValues,
  type SellPayoutMethod,
  type SellRequestSubmission,
} from '../lib/sellParts'
import { useSellStore } from '../store/sellStore'

const steps = [
  { title: 'Describe', detail: 'Tell us what you’re selling' },
  { title: 'Photos', detail: 'Show its current condition' },
  { title: 'Get a quote', detail: 'Set an asking price' },
  { title: 'Pickup & payout', detail: 'Where to reach you' },
] as const

const sellPillars = [
  { number: '01', title: 'Describe', detail: 'Share the part, its age, and its condition.' },
  { number: '02', title: 'Get Quote', detail: 'See a quick estimated offer range.' },
  { number: '03', title: 'Ship or Pickup', detail: 'Choose the handoff that works for you.' },
  { number: '04', title: 'Get Paid', detail: 'Choose your mock payout preference.' },
]

const maxPhotoBytes = 10 * 1024 * 1024
const currentYear = new Date().getFullYear()

interface LocalPhoto {
  file: File
  previewUrl: string
}

function SellParts() {
  const { '*': subpath = '' } = useParams()
  const navigate = useNavigate()
  const requests = useSellStore((state) => state.requests)
  const submitSellRequest = useSellStore((state) => state.submitSellRequest)
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<SellFormValues>(initialSellFormValues)
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const photosRef = useRef<LocalPhoto[]>([])
  const [errors, setErrors] = useState<SellFormErrors>({})
  const [photoError, setPhotoError] = useState('')
  const [recentSubmission, setRecentSubmission] = useState<{
    referenceId: string
    submission: SellRequestSubmission
  } | null>(null)

  useEffect(() => () => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
  }, [])

  const estimatedOffer = useMemo(() => {
    const askingPrice = Number(values.askingPrice)
    const purchaseYear = Number(values.purchaseYear)
    if (
      askingPrice <= 0 ||
      !Number.isFinite(askingPrice) ||
      !values.condition ||
      !Number.isInteger(purchaseYear) ||
      purchaseYear < 1980 ||
      purchaseYear > currentYear
    ) return null

    return getEstimatedOfferRange(askingPrice, values.condition, purchaseYear)
  }, [values.askingPrice, values.condition, values.purchaseYear])

  const detailReference = subpath.startsWith('requests/')
    ? decodeURIComponent(subpath.slice('requests/'.length))
    : null
  const selectedRequest = detailReference
    ? requests.find((request) => request.referenceId === detailReference)
    : undefined
  const submittedForm = recentSubmission?.referenceId === detailReference
    ? recentSubmission.submission
    : null

  function updateValue<Key extends keyof SellFormValues>(key: Key, value: SellFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    const errorsForSelection: string[] = []
    const valid: File[] = []

    for (const file of selected) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errorsForSelection.push(`${file.name}: choose an image file.`)
      } else if (file.size === 0 || file.size > maxPhotoBytes) {
        errorsForSelection.push(`${file.name}: image must be smaller than 10 MB.`)
      } else {
        valid.push(file)
      }
    }

    const remaining = Math.max(0, 5 - photos.length)
    if (valid.length > remaining) {
      errorsForSelection.push('You can add up to 5 photos.')
    }
    const nextPhotos = [
      ...photos,
      ...valid.slice(0, remaining).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]
    photosRef.current = nextPhotos
    setPhotos(nextPhotos)
    setPhotoError(errorsForSelection.join(' '))
  }

  function removePhoto(index: number) {
    const removed = photos[index]
    if (removed) URL.revokeObjectURL(removed.previewUrl)
    const nextPhotos = photos.filter((_, photoIndex) => photoIndex !== index)
    photosRef.current = nextPhotos
    setPhotos(nextPhotos)
    setPhotoError('')
  }

  function validateCurrentStep() {
    const nextErrors = validateSellStep(step, values, photos.length)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && !photoError
  }

  function continueStep() {
    if (!validateCurrentStep()) return
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  function submitRequest() {
    if (!validateCurrentStep()) return
    if (
      !isSellPartType(values.partType) ||
      !isSellCondition(values.condition) ||
      !isSellWorkingStatus(values.workingStatus) ||
      !isSellFulfillment(values.fulfillment) ||
      !isSellPayoutMethod(values.payoutMethod)
    ) return

    const submission: SellRequestSubmission = {
      partType: values.partType,
      brand: values.brand.trim(),
      model: values.model.trim(),
      purchaseYear: Number(values.purchaseYear),
      condition: values.condition,
      workingStatus: values.workingStatus,
      hasOriginalBox: values.hasOriginalBox,
      hasInvoice: values.hasInvoice,
      photoNames: photos.map((photo) => photo.file.name),
      description: values.description.trim(),
      askingPrice: Number(values.askingPrice),
      offerRange: getEstimatedOfferRange(
        Number(values.askingPrice),
        values.condition,
        Number(values.purchaseYear),
      ),
      sellerName: values.sellerName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      fulfillment: values.fulfillment,
      payoutMethod: values.payoutMethod,
      payoutDestination: values.payoutDestination.trim(),
    }
    const referenceId = submitSellRequest(submission)
    setRecentSubmission({ referenceId, submission })
    navigate(`/sell-parts/requests/${referenceId}`)
  }

  if (subpath === 'requests') {
    return (
      <Container className="sell-page sell-requests-page">
        <SellPageNav />
        <p className="destination-page__eyebrow">YOUR PCFORGE SELL HISTORY</p>
        <h1>My sell requests<span>.</span></h1>
        <p className="sell-page__lead">Your requests are saved locally in this browser.</p>
        {requests.length ? (
          <div className="sell-request-list">
            {requests.map((request) => (
              <Link className="sell-request-card" key={request.referenceId} to={`/sell-parts/requests/${request.referenceId}`}>
                <span>
                  <small>{request.referenceId} · {new Date(request.submittedAt).toLocaleDateString()}</small>
                  <strong>{request.brand} {request.model}</strong>
                  <span>{request.partType} · {request.condition} · {request.fulfillment}</span>
                </span>
                <span className="sell-request-card__offer">
                  <small>Estimated offer</small>
                  <strong>{currencyFormatter.format(request.offerRange.min)}–{currencyFormatter.format(request.offerRange.max)}</strong>
                </span>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="sell-empty-state">
            <h2>No requests yet</h2>
            <p>Submit a part for review and your local request history will appear here.</p>
          </div>
        )}
        <Link className="ui-button ui-button--primary" to="/sell-parts">Start a sell request <Icon name="arrow" /></Link>
      </Container>
    )
  }

  if (detailReference) {
    if (!selectedRequest) {
      return (
        <Container className="sell-page sell-confirmation sell-empty-state">
          <p className="destination-page__eyebrow">REQUEST NOT FOUND</p>
          <h1>This request isn’t saved here.</h1>
          <p>Sell requests are stored only in the browser where they were submitted.</p>
          <Link className="ui-button ui-button--primary" to="/sell-parts/requests">My Sell Requests</Link>
        </Container>
      )
    }

    return (
      <SellConfirmation
        request={selectedRequest}
        submission={submittedForm}
      />
    )
  }

  return (
    <div className="sell-page">
      <Container>
        <SellPageNav />
        <section className="sell-hero">
          <div className="sell-hero__copy">
            <p className="destination-page__eyebrow">GIVE YOUR GEAR A SECOND LIFE</p>
            <h1>Sell your parts.<br /><span>Make room for what’s next.</span></h1>
            <p>Trade in the hardware you’ve outgrown. Tell us what you have, get an instant estimate, and choose pickup or drop-off.</p>
            <a className="ui-button ui-button--primary" href="#sell-request">Start your sell request <Icon name="arrow" /></a>
            <small>No marketplace hassle. Mock quote, no payment or shipment is actually processed.</small>
          </div>
          <div aria-hidden="true" className="sell-hero__art">
            <div className="sell-hero__orbit sell-hero__orbit--outer" />
            <div className="sell-hero__orbit sell-hero__orbit--inner" />
            <div className="sell-hero__component"><span>PCF</span><i /><i /><i /></div>
            <span className="sell-hero__spark sell-hero__spark--one" />
            <span className="sell-hero__spark sell-hero__spark--two" />
          </div>
        </section>

        <section aria-label="How selling works" className="sell-explainer">
          {sellPillars.map((pillar) => (
            <article key={pillar.number}>
              <span>{pillar.number}</span>
              <h2>{pillar.title}</h2>
              <p>{pillar.detail}</p>
            </article>
          ))}
        </section>

        <section className="sell-form-section" id="sell-request">
          <div className="sell-form-heading">
            <div>
              <p className="destination-page__eyebrow">SELL WITH PCFORGE</p>
              <h2>Start your request<span>.</span></h2>
            </div>
            <Link className="sell-history-link" to="/sell-parts/requests">My Sell Requests ({requests.length})</Link>
          </div>
          <div aria-label="Sell request progress" className="sell-progress">
            {steps.map((item, index) => (
              <div aria-current={index === step ? 'step' : undefined} className={`sell-progress__step${index === step ? ' is-active' : ''}${index < step ? ' is-complete' : ''}`} key={item.title}>
                <span>{index < step ? <Icon name="check" /> : `0${index + 1}`}</span>
                <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              </div>
            ))}
          </div>

          <form
            className="sell-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (step < steps.length - 1) continueStep()
              else submitRequest()
            }}
          >
            {step === 0 && (
              <section aria-labelledby="sell-step-title" className="sell-step">
                <StepHeading step={1} title="What are you selling?" description="Add a few details so we can estimate its value." />
                <div className="sell-field-grid">
                  <Field label="Part type" error={errors.partType} id="sell-part-type">
                    <select aria-describedby={errors.partType ? 'sell-error-part-type' : undefined} aria-invalid={Boolean(errors.partType)} id="sell-part-type" onChange={(event) => updateValue('partType', isSellPartType(event.target.value) ? event.target.value : '')} value={values.partType}>
                      <option value="">Choose a category</option>
                      {partCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field label="Brand" error={errors.brand} id="sell-brand">
                    <input aria-describedby={errors.brand ? 'sell-error-brand' : undefined} aria-invalid={Boolean(errors.brand)} autoComplete="organization" id="sell-brand" onChange={(event) => updateValue('brand', event.target.value)} placeholder="e.g. NVIDIA, AMD, Corsair" value={values.brand} />
                  </Field>
                  <Field label="Model" error={errors.model} id="sell-model">
                    <input aria-describedby={errors.model ? 'sell-error-model' : undefined} aria-invalid={Boolean(errors.model)} id="sell-model" onChange={(event) => updateValue('model', event.target.value)} placeholder="e.g. GeForce RTX 4080" value={values.model} />
                  </Field>
                  <Field label="Purchase year" error={errors.purchaseYear} id="sell-year">
                    <input aria-describedby={errors.purchaseYear ? 'sell-error-year' : undefined} aria-invalid={Boolean(errors.purchaseYear)} id="sell-year" inputMode="numeric" max={currentYear} min="1980" onChange={(event) => updateValue('purchaseYear', event.target.value)} placeholder="2024" type="number" value={values.purchaseYear} />
                  </Field>
                  <Field label="Condition" error={errors.condition} id="sell-condition">
                    <select aria-describedby={errors.condition ? 'sell-error-condition' : undefined} aria-invalid={Boolean(errors.condition)} id="sell-condition" onChange={(event) => updateValue('condition', isSellCondition(event.target.value) ? event.target.value : '')} value={values.condition}>
                      <option value="">Choose a condition</option>
                      {sellConditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                    </select>
                  </Field>
                  <Field label="Working status" error={errors.workingStatus} id="sell-working-status">
                    <select aria-describedby={errors.workingStatus ? 'sell-error-working-status' : undefined} aria-invalid={Boolean(errors.workingStatus)} id="sell-working-status" onChange={(event) => updateValue('workingStatus', isSellWorkingStatus(event.target.value) ? event.target.value : '')} value={values.workingStatus}>
                      <option value="">Choose a status</option>
                      {sellWorkingStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="sell-checkbox-row">
                  <label><input checked={values.hasOriginalBox} onChange={(event) => updateValue('hasOriginalBox', event.target.checked)} type="checkbox" /><span>Original box included</span></label>
                  <label><input checked={values.hasInvoice} onChange={(event) => updateValue('hasInvoice', event.target.checked)} type="checkbox" /><span>Purchase invoice available</span></label>
                </div>
              </section>
            )}

            {step === 1 && (
              <section aria-labelledby="sell-step-title" className="sell-step">
                <StepHeading step={2} title="Show us your part" description="Photos help us review the condition. Images stay in this browser demo." />
                <div className="sell-upload">
                  <label className="sell-upload__picker" htmlFor="sell-photos">
                    <span aria-hidden="true">＋</span>
                    <strong>Add photos</strong>
                    <small>JPG, PNG, or WebP · up to 5 images · 10 MB each</small>
                    <input accept="image/jpeg,image/png,image/webp" aria-describedby={photoError || errors.photos ? 'sell-error-photos' : undefined} aria-invalid={Boolean(photoError || errors.photos)} id="sell-photos" multiple onChange={addPhotos} type="file" />
                  </label>
                  {photoError && <FieldError id="sell-error-photos">{photoError}</FieldError>}
                  {errors.photos && <FieldError id="sell-error-photos">{errors.photos}</FieldError>}
                  {photos.length > 0 && (
                    <div aria-label="Photo previews" className="sell-photo-grid">
                      {photos.map((photo, index) => (
                        <figure key={`${photo.file.name}-${photo.file.lastModified}-${index}`}>
                          <img alt={`Preview of ${photo.file.name}`} src={photo.previewUrl} />
                          <figcaption>{photo.file.name}</figcaption>
                          <button aria-label={`Remove ${photo.file.name}`} onClick={() => removePhoto(index)} type="button"><Icon name="close" /></button>
                        </figure>
                      ))}
                    </div>
                  )}
                  <Field label="Description" error={errors.description} id="sell-description" hint="Include known issues, included accessories, and anything else a buyer should know.">
                    <textarea aria-describedby={errors.description ? 'sell-error-description' : undefined} aria-invalid={Boolean(errors.description)} id="sell-description" onChange={(event) => updateValue('description', event.target.value)} placeholder="Describe the part’s use, appearance, and any known issues…" rows={5} value={values.description} />
                  </Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="sell-step-title" className="sell-step">
                <StepHeading step={3} title="Set your asking price" description="We’ll show an indicative range based on your asking price, condition, and age." />
                <Field label="Your asking price" error={errors.askingPrice} id="sell-asking-price" hint="Enter the amount you hope to receive, in the store’s displayed currency.">
                  <div className="sell-price-input"><span aria-hidden="true">{currencyFormatter.format(0).replace(/[\d.,\s]/g, '')}</span><input aria-describedby={errors.askingPrice ? 'sell-error-askingPrice' : 'sell-price-help'} aria-invalid={Boolean(errors.askingPrice)} id="sell-asking-price" inputMode="decimal" min="1" onChange={(event) => updateValue('askingPrice', event.target.value)} placeholder="500" type="number" value={values.askingPrice} /></div>
                </Field>
                <div className="sell-offer-card" aria-live="polite">
                  <span className="sell-offer-card__icon"><Icon name="check" /></span>
                  <div>
                    <small>INSTANT ESTIMATED OFFER RANGE</small>
                    {estimatedOffer
                      ? <strong>{currencyFormatter.format(estimatedOffer.min)} – {currencyFormatter.format(estimatedOffer.max)}</strong>
                      : <strong>Enter your price, condition, and purchase year to see an estimate.</strong>}
                    <p>This is a mock estimate, not a quote or guaranteed offer. Age and condition affect the range.</p>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section aria-labelledby="sell-step-title" className="sell-step">
                <StepHeading step={4} title="Pickup and payout" description="Tell us how to reach you and which mock payout method you prefer." />
                <div className="sell-field-grid">
                  <Field label="Your name" error={errors.sellerName} id="sell-name">
                    <input aria-describedby={errors.sellerName ? 'sell-error-name' : undefined} aria-invalid={Boolean(errors.sellerName)} autoComplete="name" id="sell-name" onChange={(event) => updateValue('sellerName', event.target.value)} value={values.sellerName} />
                  </Field>
                  <Field label="Email address" error={errors.email} id="sell-email">
                    <input aria-describedby={errors.email ? 'sell-error-email' : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" id="sell-email" onChange={(event) => updateValue('email', event.target.value)} type="email" value={values.email} />
                  </Field>
                  <Field label="Phone number" error={errors.phone} id="sell-phone">
                    <input aria-describedby={errors.phone ? 'sell-error-phone' : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" id="sell-phone" onChange={(event) => updateValue('phone', event.target.value)} type="tel" value={values.phone} />
                  </Field>
                  <Field label="Full address" error={errors.address} id="sell-address">
                    <textarea aria-describedby={errors.address ? 'sell-error-address' : undefined} aria-invalid={Boolean(errors.address)} autoComplete="street-address" id="sell-address" onChange={(event) => updateValue('address', event.target.value)} rows={3} value={values.address} />
                  </Field>
                  <Field label="Handoff preference" error={errors.fulfillment} id="sell-fulfillment">
                    <select aria-describedby={errors.fulfillment ? 'sell-error-fulfillment' : undefined} aria-invalid={Boolean(errors.fulfillment)} id="sell-fulfillment" onChange={(event) => updateValue('fulfillment', isSellFulfillment(event.target.value) ? event.target.value : '')} value={values.fulfillment}>
                      <option value="">Choose pickup or drop-off</option>
                      {sellFulfillmentOptions.map((option) => <option key={option} value={option}>{option === 'Pickup' ? 'Pickup from my address' : 'I’ll drop it off'}</option>)}
                    </select>
                  </Field>
                  <Field label="Payout method" error={errors.payoutMethod} id="sell-payout-method">
                    <select aria-describedby={errors.payoutMethod ? 'sell-error-payout-method' : undefined} aria-invalid={Boolean(errors.payoutMethod)} id="sell-payout-method" onChange={(event) => updateValue('payoutMethod', isSellPayoutMethod(event.target.value) ? event.target.value : '')} value={values.payoutMethod}>
                      <option value="">Choose a mock payout method</option>
                      {sellPayoutMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                    </select>
                  </Field>
                  {values.payoutMethod && (
                    <Field label={payoutDestinationLabel(values.payoutMethod)} error={errors.payoutDestination} id="sell-payoutDestination" hint="This mock flow does not send money. Saved request history masks this value.">
                      <input aria-describedby={errors.payoutDestination ? 'sell-error-payout-destination' : 'sell-payoutDestination-help'} aria-invalid={Boolean(errors.payoutDestination)} autoComplete="off" id="sell-payoutDestination" onChange={(event) => updateValue('payoutDestination', event.target.value)} placeholder={payoutDestinationPlaceholder(values.payoutMethod)} value={values.payoutDestination} />
                    </Field>
                  )}
                </div>
                <p className="sell-privacy-note">Demo only: request details are stored in this browser. Your payout destination is masked in saved history; nothing is sent to a server or payment provider.</p>
              </section>
            )}

            <div className="sell-form__actions">
              <button className="ui-button ui-button--outline" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button">Back</button>
              {step < steps.length - 1
                ? <button className="ui-button ui-button--primary" onClick={continueStep} type="button">Continue <Icon name="arrow" /></button>
                : <button className="ui-button ui-button--primary" onClick={submitRequest} type="button">Submit sell request <Icon name="arrow" /></button>}
            </div>
          </form>
        </section>
      </Container>
    </div>
  )
}

function SellPageNav() {
  return (
    <nav aria-label="Sell parts navigation" className="sell-page__nav">
      <Link to="/sell-parts">Sell parts</Link>
      <Link to="/sell-parts/requests">My Sell Requests</Link>
    </nav>
  )
}

function StepHeading({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="sell-step__heading">
      <p className="destination-page__eyebrow">STEP 0{step} / 04</p>
      <h3 id="sell-step-title">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Field({
  children,
  error,
  hint,
  id,
  label,
}: {
  children: ReactNode
  error?: string
  hint?: string
  id: string
  label: string
}) {
  return (
    <div className="sell-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small className="sell-field__hint" id={`${id}-help`}>{hint}</small>}
      {error && <FieldError id={fieldErrorId(id)}>{error}</FieldError>}
    </div>
  )
}

function fieldErrorId(id: string): string {
  const suffix = id.replace('sell-', '').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  return `sell-error-${suffix}`
}

function FieldError({ children, id }: { children: ReactNode; id: string }) {
  return <span className="sell-field__error" id={id} role="alert">{children}</span>
}

function SellConfirmation({
  request,
  submission,
}: {
  request: ReturnType<typeof useSellStore.getState>['requests'][number]
  submission: SellRequestSubmission | null
}) {
  const shownDestination = submission?.payoutDestination ?? request.payoutDestinationMasked
  const photoNames = submission?.photoNames ?? request.photoNames

  return (
    <Container className="sell-page sell-confirmation">
      <div aria-hidden="true" className="sell-confetti">
        {Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--confetti-index': index } as CSSProperties} />)}
      </div>
      <header className="sell-confirmation__hero">
        <span className="sell-confirmation__check"><Icon name="check" /></span>
        <p className="destination-page__eyebrow">REQUEST RECEIVED</p>
        <h1>You’re on your way<span>.</span></h1>
        <p>Your sell request has been saved in this browser. This mock flow does not schedule an actual pickup or payment.</p>
        <div className="sell-confirmation__reference"><small>REFERENCE ID</small><strong>{request.referenceId}</strong></div>
      </header>
      <div className="sell-confirmation__layout">
        <section className="sell-confirmation__card">
          <p className="destination-page__eyebrow">REQUEST SUMMARY</p>
          <h2>{request.brand} {request.model}</h2>
          <dl className="sell-summary">
            <SummaryRow label="Part type" value={request.partType} />
            <SummaryRow label="Brand" value={request.brand} />
            <SummaryRow label="Model" value={request.model} />
            <SummaryRow label="Purchase year" value={String(request.purchaseYear)} />
            <SummaryRow label="Condition" value={request.condition} />
            <SummaryRow label="Working status" value={request.workingStatus} />
            <SummaryRow label="Original box" value={request.hasOriginalBox ? 'Included' : 'Not included'} />
            <SummaryRow label="Invoice" value={request.hasInvoice ? 'Available' : 'Not available'} />
            <SummaryRow label="Description" value={request.description} />
            <SummaryRow label="Photos" value={photoNames.length ? photoNames.join(', ') : 'No photos attached'} />
            <SummaryRow label="Asking price" value={currencyFormatter.format(request.askingPrice)} />
            <SummaryRow label="Estimated offer range" value={`${currencyFormatter.format(request.offerRange.min)} – ${currencyFormatter.format(request.offerRange.max)} · indicative only`} />
            <SummaryRow label="Seller" value={request.sellerName} />
            <SummaryRow label="Email" value={request.email} />
            <SummaryRow label="Phone" value={request.phone} />
            <SummaryRow label="Address" value={request.address} />
            <SummaryRow label="Handoff" value={request.fulfillment} />
            <SummaryRow label="Payout method" value={request.payoutMethod} />
            <SummaryRow label="Payout details" value={shownDestination} />
          </dl>
        </section>
        <aside className="sell-confirmation__side">
          <div className="sell-pickup-estimate">
            <span aria-hidden="true">↗</span>
            <div><small>HANDOFF ESTIMATE</small><strong>Pickup within 4 days</strong><p>Display-only estimate. No pickup is booked in this demo.</p></div>
          </div>
          <Link className="ui-button ui-button--primary" to="/sell-parts/requests">My Sell Requests <Icon name="arrow" /></Link>
          <Link className="ui-button ui-button--outline" to="/sell-parts">Submit another part</Link>
        </aside>
      </div>
    </Container>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

function payoutDestinationLabel(method: SellPayoutMethod): string {
  if (method === 'UPI') return 'UPI ID'
  if (method === 'PayPal') return 'PayPal email'
  return 'Mock bank account name or last 4 digits'
}

function payoutDestinationPlaceholder(method: SellPayoutMethod): string {
  if (method === 'UPI') return 'name@bank'
  if (method === 'PayPal') return 'you@example.com'
  return 'e.g. Checking •••• 4242'
}

export default SellParts
