import { useEffect, useMemo, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import DeliveryBadge from '../components/ui/DeliveryBadge'
import Icon from '../components/layout/Icon'
import { currencyFormatter } from '../config'
import { parts, type Part } from '../data/parts'
import { getPartPrice } from '../lib/partsCatalog'
import {
  buildComponentCategories,
  buildPresets,
  buildSteps,
  CUSTOM_BUILD_ASSEMBLY_FEE,
  EXTENDED_WARRANTY_PRICE,
  getBuildPartsPrice,
  getBuildValidationIssues,
  getBuildWattage,
  getPartCompatibilityIssues,
  getSelectedParts,
  PREMIUM_CABLE_MANAGEMENT_FEE,
  WINDOWS_HOME_PRICE,
  WINDOWS_PRO_PRICE,
  type BuildColorTheme,
  type BuildComponentCategory,
} from '../lib/customBuild'
import { useBuildStore } from '../store/buildStore'
import { useCartStore } from '../store/cartStore'
import AddToCartButton from '../components/shop/AddToCartButton'
import LazyImage from '../components/ui/LazyImage'

const colorValues: Record<BuildColorTheme, string> = {
  Scarlet: '#e11d2e',
  Midnight: '#8675e8',
  Frost: '#7ec9ff',
  Graphite: '#aaaab1',
}

const themeNames = Object.keys(colorValues) as BuildColorTheme[]

const performanceTiers = [
  { label: 'Gaming', type: 'gaming' },
  { label: 'Creator', type: 'creator' },
  { label: 'Budget', type: 'budget' },
] as const

const customDelivery = { kind: 'custom-build' as const, id: 'custom-build', name: 'Custom PC build' }

function getPartById(id: string | undefined): Part | undefined {
  return parts.find((part) => part.id === id)
}

function getPreloadedSelections(state: unknown): Partial<Record<BuildComponentCategory, string>> | null {
  if (!state || typeof state !== 'object' || !('preloadedBuild' in state)) return null
  const value = state.preloadedBuild
  if (!value || typeof value !== 'object' || !('parts' in value) || !Array.isArray(value.parts)) return null

  const selections: Partial<Record<BuildComponentCategory, string>> = {}
  for (const preloadedPart of value.parts) {
    if (!preloadedPart || typeof preloadedPart !== 'object' || !('category' in preloadedPart) || !('name' in preloadedPart)) continue
    if (typeof preloadedPart.category !== 'string' || typeof preloadedPart.name !== 'string') continue
    const category = buildComponentCategories.find((item) => item.toLowerCase() === preloadedPart.category.toLowerCase())
    if (!category) continue
    const match = parts.find((part) =>
      part.category === category &&
      (preloadedPart.name.toLowerCase().includes(part.name.toLowerCase()) ||
        part.name.toLowerCase().includes(preloadedPart.name.toLowerCase())),
    )
    if (match) selections[category] = match.id
  }

  return Object.keys(selections).length > 0 ? selections : null
}

function getPerformanceScores(selectedPartIds: Partial<Record<BuildComponentCategory, string>>, total: number) {
  const cpu = getPartById(selectedPartIds.CPU)
  const gpu = getPartById(selectedPartIds.GPU)
  const ram = getPartById(selectedPartIds.RAM)
  const cpuCores = Number(cpu?.specs.cores ?? 0)
  const ramCapacity = Number(String(ram?.specs.capacity ?? '0').match(/\d+/)?.[0] ?? 0)
  const gpuScore = !gpu ? 0
    : /5090/i.test(gpu.name) ? 100
      : /5080/i.test(gpu.name) ? 88
        : /5070 ti/i.test(gpu.name) ? 78
          : /5070/i.test(gpu.name) ? 68
            : /9070 xt/i.test(gpu.name) ? 75
              : /9060/i.test(gpu.name) ? 60
                : 45

  return {
    gaming: Math.min(100, Math.round(gpuScore * 0.72 + Math.min(cpuCores, 24) * 1.15)),
    creator: Math.min(100, Math.round(Math.min(cpuCores, 24) * 2.2 + Math.min(ramCapacity, 128) * 0.2 + gpuScore * 0.25)),
    budget: Math.max(0, Math.min(100, Math.round(100 - Math.max(0, total - 1000) / 55))),
  }
}

function Customize() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentStep = useBuildStore((state) => state.currentStep)
  const selectedPartIds = useBuildStore((state) => state.selectedPartIds)
  const presetId = useBuildStore((state) => state.presetId)
  const extraFanIds = useBuildStore((state) => state.extraFanIds)
  const operatingSystem = useBuildStore((state) => state.operatingSystem)
  const extendedWarranty = useBuildStore((state) => state.extendedWarranty)
  const rgbLighting = useBuildStore((state) => state.rgbLighting)
  const cableManagement = useBuildStore((state) => state.cableManagement)
  const colorTheme = useBuildStore((state) => state.colorTheme)
  const setPart = useBuildStore((state) => state.setPart)
  const goToStep = useBuildStore((state) => state.goToStep)
  const setPreset = useBuildStore((state) => state.setPreset)
  const setExtraFans = useBuildStore((state) => state.setExtraFans)
  const setOperatingSystem = useBuildStore((state) => state.setOperatingSystem)
  const setExtendedWarranty = useBuildStore((state) => state.setExtendedWarranty)
  const setRgbLighting = useBuildStore((state) => state.setRgbLighting)
  const setCableManagement = useBuildStore((state) => state.setCableManagement)
  const setColorTheme = useBuildStore((state) => state.setColorTheme)
  const addToCart = useCartStore((state) => state.add)

  const preloadedSelections = useMemo(() => getPreloadedSelections(location.state), [location.state])
  useEffect(() => {
    if (!preloadedSelections) return
    for (const category of buildComponentCategories) {
      const partId = preloadedSelections[category]
      if (partId) setPart(category, partId)
    }
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate, preloadedSelections, setPart])

  const selectedParts = useMemo(() => getSelectedParts(selectedPartIds), [selectedPartIds])
  const selectedFans = useMemo(
    () => extraFanIds.flatMap((id) => {
      const part = getPartById(id)
      return part ? [part] : []
    }),
    [extraFanIds],
  )
  const wattage = getBuildWattage(selectedPartIds)
  const basePartsPrice = getBuildPartsPrice(selectedPartIds)
  const extrasPrice = selectedFans.reduce((total, part) => total + getPartPrice(part), 0)
    + (operatingSystem === 'Windows 11 Home' ? WINDOWS_HOME_PRICE : operatingSystem === 'Windows 11 Pro' ? WINDOWS_PRO_PRICE : 0)
    + (extendedWarranty ? EXTENDED_WARRANTY_PRICE : 0)
  const assemblyFee = CUSTOM_BUILD_ASSEMBLY_FEE + (cableManagement === 'premium' ? PREMIUM_CABLE_MANAGEMENT_FEE : 0)
  const total = basePartsPrice + extrasPrice + assemblyFee
  const validationIssues = getBuildValidationIssues(selectedPartIds)
  const selectedCase = getPartById(selectedPartIds.Case)
  const currentStepData = buildSteps[currentStep] ?? buildSteps[0]
  const category = currentStepData.category
  const currentPart = category ? getPartById(selectedPartIds[category]) : undefined
  const candidateParts = category ? parts.filter((part) => part.category === category) : []
  const compatibleCandidates = candidateParts.filter(
    (part) => getPartCompatibilityIssues(part, selectedPartIds).length === 0,
  )
  const recommendedId = compatibleCandidates
    .toSorted((first, second) => second.rating - first.rating)[0]?.id
  const performance = getPerformanceScores(selectedPartIds, total)
  const wattagePercent = Math.min(100, Math.round((wattage / 1300) * 100))

  function choosePreset(id: string) {
    setPreset(id)
  }

  function toggleFan(partId: string) {
    setExtraFans(extraFanIds.includes(partId)
      ? extraFanIds.filter((id) => id !== partId)
      : [...extraFanIds, partId])
  }

  function addBuildToCart(andCheckout: boolean) {
    if (validationIssues.length > 0) {
      goToStep(9)
      return
    }

    const selectedBuildParts = [...selectedParts, ...selectedFans]
    const build = {
      kind: 'custom-build' as const,
      id: `custom-build-${selectedParts.map((part) => part.id).join('-')}-${colorTheme.toLowerCase()}`,
      name: `${colorTheme} Custom PC`,
      price: total,
      parts: selectedBuildParts,
      image: selectedCase?.image,
      buildOptions: {
        cableManagement,
        colorTheme,
        operatingSystem,
        extendedWarranty,
        rgbLighting,
        assemblyFee,
      },
    }

    addToCart(build)
    if (andCheckout) navigate('/checkout', { state: { buyNow: build.id } })
  }

  function goNext() {
    if (currentStep === 9) return
    if (currentStep < 8 && !currentPart) return
    goToStep(currentStep + 1)
  }

  return (
    <div className="customize-page">
      <Container>
        <div className="customize-page__header">
          <div>
            <p className="destination-page__eyebrow">YOUR PC · YOUR WAY</p>
            <h1>Build your system<span>.</span></h1>
            <p>Choose your parts, check compatibility, and we’ll assemble and test your build.</p>
          </div>
          <button className="customize-reset" onClick={() => useBuildStore.getState().resetBuild()} type="button">Start over</button>
        </div>

        <section aria-label="Build presets" className="builder-presets">
          <div>
            <p className="destination-page__eyebrow">START WITH A PRESET</p>
            <h2>Choose your starting point</h2>
          </div>
          <div className="builder-presets__grid">
            {buildPresets.map((preset) => (
              <button
                aria-pressed={presetId === preset.id}
                className="builder-preset"
                key={preset.id}
                onClick={() => choosePreset(preset.id)}
                type="button"
              >
                <span>{preset.name}</span>
                <small>{preset.description}</small>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </section>

        <div className="builder-steps" aria-label="Build steps">
          {buildSteps.map((step, index) => {
            const stepComplete = index < 8
              ? Boolean(selectedPartIds[step.category as BuildComponentCategory])
              : index === 8
            return (
              <button
                aria-current={currentStep === index ? 'step' : undefined}
                className={`builder-step${currentStep === index ? ' is-active' : ''}${stepComplete ? ' is-complete' : ''}`}
                key={step.title}
                onClick={() => goToStep(index)}
                type="button"
              >
                <span>{stepComplete && index < currentStep ? <Icon name="check" /> : String(index + 1).padStart(2, '0')}</span>
                <small>{step.title}</small>
              </button>
            )
          })}
        </div>

        <div className="builder-layout">
          <section aria-labelledby="builder-current-step" className="builder-options">
            <div className="builder-options__heading">
              <div>
                <p className="destination-page__eyebrow">STEP {String(currentStep + 1).padStart(2, '0')} / 10</p>
                <h2 id="builder-current-step">{currentStepData.title}</h2>
                <p>{currentStepData.hint}</p>
              </div>
              {currentPart && category && (
                <button className="builder-options__clear" onClick={() => setPart(category, null)} type="button">
                  Remove selected {category}
                </button>
              )}
            </div>

            {currentStep < 8 && category && (
              <div className="builder-part-grid">
                {candidateParts.map((part) => {
                  const issues = getPartCompatibilityIssues(part, selectedPartIds)
                  const selected = selectedPartIds[category] === part.id
                  const isRecommended = part.id === recommendedId && !issues.length
                  return (
                    <button
                      aria-pressed={selected}
                      className={`builder-part-option${selected ? ' is-selected' : ''}${issues.length ? ' has-warning' : ''}`}
                      key={part.id}
                      onClick={() => setPart(category, part.id)}
                      type="button"
                    >
                      <span className="builder-part-option__image">
                        <LazyImage alt="" height="340" loading="lazy" src={part.image} width="420" />
                        {isRecommended && <span className="builder-recommended">Recommended</span>}
                        {selected && <span aria-label="Selected" className="builder-part-option__selected"><Icon name="check" /></span>}
                      </span>
                      <span className="builder-part-option__body">
                        <span className="builder-part-option__brand">{part.brand} · {part.category}</span>
                        <strong>{part.name}</strong>
                        <span className="builder-part-option__specs">
                          {Object.entries(part.specs).slice(0, 3).map(([label, value]) => `${label}: ${String(value)}`).join(' · ')}
                        </span>
                        {issues.map((issue) => <span className="builder-compatibility-warning" key={issue}>{issue}</span>)}
                        <span className="builder-part-option__price">{currencyFormatter.format(getPartPrice(part))}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {currentStep === 8 && (
              <div className="builder-extras">
                <section className="builder-extra-group">
                  <h3>Extra fans <small>Optional · choose up to 3</small></h3>
                  <div className="builder-extra-options">
                    {parts.filter((part) => part.category === 'Fans').map((fan) => {
                      const selected = extraFanIds.includes(fan.id)
                      const maxed = !selected && extraFanIds.length >= 3
                      return (
                        <label className={`builder-extra-card${selected ? ' is-selected' : ''}`} key={fan.id}>
                          <input checked={selected} disabled={maxed} onChange={() => toggleFan(fan.id)} type="checkbox" />
                          <span><strong>{fan.name}</strong><small>{Object.entries(fan.specs).slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(' · ')}</small></span>
                          <b>{currencyFormatter.format(getPartPrice(fan))}</b>
                        </label>
                      )
                    })}
                  </div>
                </section>
                <fieldset className="builder-extra-group builder-extra-group--choices">
                  <legend>Operating system</legend>
                  {(['none', 'Windows 11 Home', 'Windows 11 Pro'] as const).map((system) => (
                    <label className="builder-radio-option" key={system}>
                      <input checked={operatingSystem === system} name="operating-system" onChange={() => setOperatingSystem(system)} type="radio" />
                      <span>{system === 'none' ? 'No operating system' : system}</span>
                      <strong>{system === 'none' ? 'Included' : currencyFormatter.format(system === 'Windows 11 Home' ? WINDOWS_HOME_PRICE : WINDOWS_PRO_PRICE)}</strong>
                    </label>
                  ))}
                </fieldset>
                <label className="builder-warranty">
                  <input checked={extendedWarranty} onChange={(event) => setExtendedWarranty(event.target.checked)} type="checkbox" />
                  <span><strong>Add 3-year extended warranty</strong><small>Extend parts and labor coverage beyond the included warranty.</small></span>
                  <b>{currencyFormatter.format(EXTENDED_WARRANTY_PRICE)}</b>
                </label>
                <label className="builder-warranty builder-rgb-option">
                  <input checked={rgbLighting} onChange={(event) => setRgbLighting(event.target.checked)} type="checkbox" />
                  <span><strong>RGB lighting</strong><small>Light up the fans and internal accents in your selected build theme.</small></span>
                  <b>Included</b>
                </label>
                <fieldset className="builder-extra-group builder-extra-group--choices">
                  <legend>Cable management</legend>
                  <label className="builder-radio-option">
                    <input checked={cableManagement === 'standard'} name="cable-management" onChange={() => setCableManagement('standard')} type="radio" />
                    <span>Clean and functional</span><strong>Included</strong>
                  </label>
                  <label className="builder-radio-option">
                    <input checked={cableManagement === 'premium'} name="cable-management" onChange={() => setCableManagement('premium')} type="radio" />
                    <span>Premium showcase routing</span><strong>+{currencyFormatter.format(PREMIUM_CABLE_MANAGEMENT_FEE)}</strong>
                  </label>
                </fieldset>
                <fieldset className="builder-extra-group builder-extra-group--choices">
                  <legend>Build color theme</legend>
                  <div className="builder-color-options">
                    {themeNames.map((theme) => (
                      <button
                        aria-pressed={colorTheme === theme}
                        className="builder-color-option"
                        key={theme}
                        onClick={() => setColorTheme(theme)}
                        style={{ '--build-accent': colorValues[theme] } as CSSProperties}
                        type="button"
                      >
                        <span />{theme}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {currentStep === 9 && (
              <div className="builder-review">
                {validationIssues.length > 0 ? (
                  <div aria-live="polite" className="builder-review__issues">
                    <h3>Build needs attention</h3>
                    <ul>{validationIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                  </div>
                ) : (
                  <div className="builder-review__ready">
                    <span><Icon name="check" /></span>
                    <div><strong>Everything looks compatible.</strong><p>Your parts are ready for assembly and quality testing.</p></div>
                  </div>
                )}
                <div className="builder-review__parts">
                  {[...selectedParts, ...selectedFans].map((part) => (
                    <div key={part.id}>
                      <span><small>{part.category}</small><strong>{part.name}</strong></span>
                      <b>{currencyFormatter.format(getPartPrice(part))}</b>
                    </div>
                  ))}
                  {operatingSystem !== 'none' && <div><span><small>Software</small><strong>{operatingSystem}</strong></span><b>{currencyFormatter.format(operatingSystem === 'Windows 11 Home' ? WINDOWS_HOME_PRICE : WINDOWS_PRO_PRICE)}</b></div>}
                  {extendedWarranty && <div><span><small>Protection</small><strong>3-year extended warranty</strong></span><b>{currencyFormatter.format(EXTENDED_WARRANTY_PRICE)}</b></div>}
                  {rgbLighting && <div><span><small>Lighting</small><strong>RGB lighting · {colorTheme} theme</strong></span><b>Included</b></div>}
                  <div><span><small>Assembly</small><strong>Hand-built, cable-managed, stress-tested and quality checked</strong></span><b>{currencyFormatter.format(assemblyFee)}</b></div>
                </div>
                <div className="builder-review__total"><span>Build total</span><strong>{currencyFormatter.format(total)}</strong></div>
                <DeliveryBadge item={customDelivery} />
                <div className="builder-review__actions">
                  <AddToCartButton
                    className="ui-button ui-button--outline"
                    disabled={validationIssues.length > 0}
                    itemName={`${colorTheme} Custom PC`}
                    onAdd={() => addBuildToCart(false)}
                    label="Add Build to Cart"
                  />
                  <button className="ui-button ui-button--primary" disabled={validationIssues.length > 0} onClick={() => addBuildToCart(true)} type="button">Order This Build <Icon name="arrow" /></button>
                </div>
              </div>
            )}

            {currentStep < 9 && (
              <div className="builder-options__navigation">
                <button className="ui-button ui-button--ghost" disabled={currentStep === 0} onClick={() => goToStep(currentStep - 1)} type="button">Back</button>
                <button className="ui-button ui-button--primary" disabled={currentStep < 8 && !currentPart} onClick={goNext} type="button">
                  {currentStep === 8 ? 'Review your build' : 'Continue'} <Icon name="arrow" />
                </button>
              </div>
            )}
          </section>

          <aside aria-label="Live build summary" className="builder-summary">
            <div className="builder-summary__header">
              <div><p className="destination-page__eyebrow">LIVE CONFIGURATION</p><h2>{colorTheme} build</h2></div>
              <span className="builder-summary__count">{selectedParts.length}/8</span>
            </div>
            <div
              aria-label={`${colorTheme} PC preview`}
              className="builder-pc-preview"
              data-rgb-lighting={rgbLighting}
              style={{ '--build-accent': colorValues[colorTheme] } as CSSProperties}
            >
              <div className="builder-pc-preview__glow" />
              <div className="builder-pc-preview__case">
                <div className="builder-pc-preview__glass">
                  <span className="builder-pc-preview__fan builder-pc-preview__fan--one" />
                  <span className="builder-pc-preview__fan builder-pc-preview__fan--two" />
                  <span className="builder-pc-preview__gpu" />
                  <span className="builder-pc-preview__ram" />
                </div>
                <div className="builder-pc-preview__front">
                  <i /><i /><i />
                </div>
              </div>
              {selectedCase && <span className="builder-pc-preview__case-name">{selectedCase.name}</span>}
              <span className="builder-pc-preview__theme">{colorTheme.toUpperCase()} SERIES</span>
            </div>
            <div className="builder-summary__price">
              <span>Current build total</span>
              <strong>{currencyFormatter.format(total)}</strong>
              <small>Includes {currencyFormatter.format(assemblyFee)} assembly and QA</small>
            </div>
            <div className="builder-wattage">
              <div><strong>Estimated system draw</strong><span>{wattage} W</span></div>
              <div aria-label={`${wattagePercent}% of 1300 watts`} className="builder-wattage__track"><span style={{ width: `${wattagePercent}%` }} /></div>
              <small>PSU recommendation includes a 25% headroom margin.</small>
            </div>
            <div className="builder-summary__parts">
              <h3>Selected components</h3>
              {buildComponentCategories.map((component) => {
                const part = getPartById(selectedPartIds[component])
                return (
                  <div className={part ? '' : 'is-empty'} key={component}>
                    <span>{component}</span>
                    <strong>{part?.name ?? 'Choose a part'}</strong>
                  </div>
                )
              })}
            </div>
            <div className="builder-performance">
              <h3>Performance profile</h3>
              {performanceTiers.map((tier) => (
                <div className="builder-performance__row" key={tier.type}>
                  <span>{tier.label}</span>
                  <span aria-label={`${tier.label} score ${performance[tier.type]} out of 100`} className="builder-performance__track">
                    <span style={{ width: `${performance[tier.type]}%` }} />
                  </span>
                  <strong>{performance[tier.type]}</strong>
                </div>
              ))}
            </div>
            {presetId && <p className="builder-summary__preset">Preset · {buildPresets.find((preset) => preset.id === presetId)?.name}</p>}
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default Customize
