import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
import { currencyFormatter } from '../config'
import { isCaseFitsGpu, isCpuMotherboardCompatible, isPsuEnough, isRamCompatible, estimateTotalWattage } from '../data/compatibility'
import { parts, type Part } from '../data/parts'
import { getPartPrice } from '../lib/partsCatalog'
import AddToCartButton from '../components/shop/AddToCartButton'

const gpuParts = parts.filter((part) => part.category === 'GPU')
const cpuParts = parts.filter((part) => part.category === 'CPU')
const motherboardParts = parts.filter((part) => part.category === 'Motherboard')
const ramParts = parts.filter((part) => part.category === 'RAM')
const caseParts = parts.filter((part) => part.category === 'Case')
const psuParts = parts.filter((part) => part.category === 'PSU')

type GpuSortKey = 'name' | 'price' | 'memory' | 'power'

function BuildHelp() {
  const { pathname } = useLocation()
  const section = pathname.replace('/build-help', '').replace(/^\/|\/$/g, '')

  if (section === 'component-quick-picks') return <ComponentQuickPicks />
  if (section === 'gpu-comparison') return <GpuComparison />
  if (section === 'psu-quick-picks') return <PsuQuickPicks />
  if (section === 'compatibility-guide') return <CompatibilityGuide />
  if (section === 'price-watch') return <PriceWatch />
  return <BuildHelpHub />
}

function BuildHelpHub() {
  const resources = [
    { title: 'Component Quick Picks', description: 'Builder-tested starting points for your next PC.', to: '/build-help/component-quick-picks', label: 'SHOP SMARTER' },
    { title: 'GPU Comparison Chart', description: 'Compare graphics cards side by side by specs and price.', to: '/build-help/gpu-comparison', label: 'COMPARE GPUS' },
    { title: 'PSU Quick Picks', description: 'Find a power supply with practical headroom for your build.', to: '/build-help/psu-quick-picks', label: 'POWER YOUR BUILD' },
    { title: 'Compatibility Guide', description: 'Check socket, memory, case clearance, and PSU fit.', to: '/build-help/compatibility-guide', label: 'CHECK FIT' },
    { title: 'PC Price Watch', description: 'Review mock price targets across popular components.', to: '/build-help/price-watch', label: 'WATCH PRICES' },
  ]

  return (
    <Container className="account-page help-page">
      <header className="destination-page__header"><p className="destination-page__eyebrow">KNOW BEFORE YOU BUILD</p><h1>Build help<span>.</span></h1><p>Clear recommendations and practical tools to make component choices easier.</p></header>
      <div className="help-resource-grid">
        {resources.map((resource, index) => <Link className="help-resource-card" key={resource.to} to={resource.to}><span>{String(index + 1).padStart(2, '0')} · {resource.label}</span><strong>{resource.title}</strong><p>{resource.description}</p><b aria-hidden="true">↗</b></Link>)}
      </div>
    </Container>
  )
}

function ComponentQuickPicks() {
  const recommendations: Array<{ label: string; part: Part; reason: string }> = [
    { label: 'Gaming CPU', part: cpuParts.find((part) => part.id === 'cpu-ryzen-7-9800x3d')!, reason: 'Excellent gaming performance on the AM5 platform.' },
    { label: 'High-end GPU', part: gpuParts.find((part) => part.id === 'gpu-rtx-5070ti')!, reason: 'A balanced high-refresh 1440p option with 16GB of VRAM.' },
    { label: 'Everyday memory', part: ramParts.find((part) => part.id === 'ram-vengeance-32-ddr5')!, reason: '32GB DDR5 provides a versatile starting point for modern builds.' },
    { label: 'Fast storage', part: parts.find((part) => part.id === 'ssd-990pro-2tb')!, reason: 'A fast 2TB NVMe drive for games and active projects.' },
  ]

  return (
    <HelpPage title="Component Quick Picks" eyebrow="START WITH A STRONG FOUNDATION" description="A few versatile mock-data recommendations to help you get started; compare current specs and compatibility before buying.">
      <div className="quick-pick-grid">
        {recommendations.map(({ label, part, reason }) => <article className="quick-pick-card" key={part.id}><p className="destination-page__eyebrow">{label}</p><h2>{part.brand} {part.name}</h2><p>{reason}</p><div><strong>{currencyFormatter.format(getPartPrice(part))}</strong><Link to={`/parts/${part.id}`}>View part →</Link></div></article>)}
      </div>
      <Link className="ui-button ui-button--outline" to="/parts">Browse all parts</Link>
    </HelpPage>
  )
}

function GpuComparison() {
  const [sortKey, setSortKey] = useState<GpuSortKey>('name')
  const [ascending, setAscending] = useState(true)
  const sortedGpus = useMemo(() => [...gpuParts].sort((a, b) => {
    let comparison = 0
    if (sortKey === 'name') comparison = `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`)
    if (sortKey === 'price') comparison = getPartPrice(a) - getPartPrice(b)
    if (sortKey === 'memory') comparison = getGpuMemory(a) - getGpuMemory(b)
    if (sortKey === 'power') comparison = (a.compatibility.tdp ?? 0) - (b.compatibility.tdp ?? 0)
    return ascending ? comparison : -comparison
  }), [ascending, sortKey])

  function sortBy(key: GpuSortKey) {
    if (sortKey === key) setAscending((value) => !value)
    else {
      setSortKey(key)
      setAscending(true)
    }
  }

  function sortButton(label: string, key: GpuSortKey) {
    return <button aria-label={`Sort by ${label}`} onClick={() => sortBy(key)} type="button">{label}{sortKey === key ? ascending ? ' ↑' : ' ↓' : ''}</button>
  }

  return (
    <HelpPage title="GPU Comparison" eyebrow="THE GRAPHICS CARD LINEUP" description="Sort mock catalog graphics cards by name, price, memory, or rated board power. Prices and specifications are illustrative catalog data.">
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead><tr><th aria-sort={sortKey === 'name' ? ascending ? 'ascending' : 'descending' : 'none'}>{sortButton('Model', 'name')}</th><th>Brand</th><th aria-sort={sortKey === 'memory' ? ascending ? 'ascending' : 'descending' : 'none'}>{sortButton('VRAM', 'memory')}</th><th>Length</th><th aria-sort={sortKey === 'power' ? ascending ? 'ascending' : 'descending' : 'none'}>{sortButton('TDP', 'power')}</th><th aria-sort={sortKey === 'price' ? ascending ? 'ascending' : 'descending' : 'none'}>{sortButton('Price', 'price')}</th><th>Rating</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{sortedGpus.map((gpu) => <tr key={gpu.id}><th scope="row"><Link to={`/parts/${gpu.id}`}>{gpu.name}</Link></th><td>{gpu.brand}</td><td>{String(gpu.specs.memory ?? 'Not listed')}</td><td>{gpu.compatibility.gpuLengthMm ?? '—'} mm</td><td>{gpu.compatibility.tdp ?? '—'} W</td><td>{currencyFormatter.format(getPartPrice(gpu))}</td><td>★ {gpu.rating.toFixed(1)}</td><td><AddToCartButton className="ui-button ui-button--outline" item={{ ...gpu, kind: 'part' }} label="Add" /></td></tr>)}</tbody>
        </table>
      </div>
      <p className="help-page__fineprint">Performance depends on the system, game, resolution, and settings. Confirm current manufacturer specifications for final purchasing decisions.</p>
    </HelpPage>
  )
}

function PsuQuickPicks() {
  const recommendations = psuParts.map((psu) => {
    const wattage = psu.compatibility.psuWattage ?? 0
    return { psu, wattage, recommendation: wattage >= 1000 ? 'High-end GPU systems' : wattage >= 850 ? 'Enthusiast gaming builds' : 'Mid-range gaming builds' }
  })

  return (
    <HelpPage title="PSU Quick Picks" eyebrow="POWER WITH ROOM TO GROW" description="These mock picks include practical wattage tiers. Check your actual components and connector requirements before choosing.">
      <div className="quick-pick-grid">
        {recommendations.map(({ psu, wattage, recommendation }) => <article className="quick-pick-card" key={psu.id}><p className="destination-page__eyebrow">{wattage} W · {recommendation}</p><h2>{psu.brand} {psu.name}</h2><p>{String(psu.specs.efficiency)} · {String(psu.specs.modular)}</p><div><strong>{currencyFormatter.format(getPartPrice(psu))}</strong><Link to={`/parts/${psu.id}`}>View PSU →</Link></div></article>)}
      </div>
    </HelpPage>
  )
}

function CompatibilityGuide() {
  const [selectedIds, setSelectedIds] = useState({
    cpu: cpuParts[0]?.id ?? '',
    motherboard: motherboardParts[0]?.id ?? '',
    ram: ramParts[0]?.id ?? '',
    gpu: gpuParts[0]?.id ?? '',
    case: caseParts[0]?.id ?? '',
    psu: psuParts[0]?.id ?? '',
  })
  const selections = {
    cpu: cpuParts.find((part) => part.id === selectedIds.cpu),
    motherboard: motherboardParts.find((part) => part.id === selectedIds.motherboard),
    ram: ramParts.find((part) => part.id === selectedIds.ram),
    gpu: gpuParts.find((part) => part.id === selectedIds.gpu),
    case: caseParts.find((part) => part.id === selectedIds.case),
    psu: psuParts.find((part) => part.id === selectedIds.psu),
  }
  const selectedPowerParts = [selections.cpu, selections.gpu].filter((part): part is Part => part !== undefined)
  const totalWattage = estimateTotalWattage(selectedPowerParts)
  const checks = [
    { label: 'CPU socket and motherboard', ready: selections.cpu && selections.motherboard ? isCpuMotherboardCompatible(selections.cpu, selections.motherboard) : false, reason: 'CPU and motherboard sockets must match.' },
    { label: 'Memory and motherboard', ready: selections.ram && selections.motherboard ? isRamCompatible(selections.ram, selections.motherboard) : false, reason: 'Memory generation must match the motherboard.' },
    { label: 'GPU length and case clearance', ready: selections.case && selections.gpu ? isCaseFitsGpu(selections.case, selections.gpu) : false, reason: 'GPU length must not exceed the case clearance.' },
    { label: 'PSU capacity', ready: selections.psu ? isPsuEnough(totalWattage, selections.psu) : false, reason: `Estimated draw is ${totalWattage}W; allow at least 25% headroom.` },
  ]

  function selectField(label: string, value: string, options: Part[], onChange: (id: string) => void) {
    return <label className="compatibility-field">{label}<select onChange={(event) => onChange(event.target.value)} value={value}>{options.map((part) => <option key={part.id} value={part.id}>{part.brand} {part.name}</option>)}</select></label>
  }

  return (
    <HelpPage title="Compatibility Guide" eyebrow="CHECK THE FIT BEFORE YOU BUY" description="Select example components to check the same CPU, RAM, case-clearance, and PSU rules used by the PC builder.">
      <div className="compatibility-tool">
        <div className="compatibility-tool__fields">
          {selectField('CPU', selectedIds.cpu, cpuParts, (id) => setSelectedIds((value) => ({ ...value, cpu: id })))}
          {selectField('Motherboard', selectedIds.motherboard, motherboardParts, (id) => setSelectedIds((value) => ({ ...value, motherboard: id })))}
          {selectField('RAM', selectedIds.ram, ramParts, (id) => setSelectedIds((value) => ({ ...value, ram: id })))}
          {selectField('GPU', selectedIds.gpu, gpuParts, (id) => setSelectedIds((value) => ({ ...value, gpu: id })))}
          {selectField('Case', selectedIds.case, caseParts, (id) => setSelectedIds((value) => ({ ...value, case: id })))}
          {selectField('PSU', selectedIds.psu, psuParts, (id) => setSelectedIds((value) => ({ ...value, psu: id })))}
        </div>
        <p className="compatibility-tool__wattage">Estimated CPU + GPU build draw: <strong>{totalWattage}W</strong></p>
        <ul className="compatibility-results">{checks.map((check) => <li className={check.ready ? 'is-compatible' : 'is-incompatible'} key={check.label}><span aria-hidden="true">{check.ready ? '✓' : '!'}</span><div><strong>{check.label}</strong><p>{check.ready ? 'Selected components appear compatible.' : check.reason}</p></div></li>)}</ul>
      </div>
      <Link className="ui-button ui-button--primary" to="/customize">Build a compatible PC</Link>
    </HelpPage>
  )
}

function PriceWatch() {
  const watchParts = [...parts].sort((a, b) => getPartPrice(a) - getPartPrice(b)).slice(0, 12)

  return (
    <HelpPage title="PC Price Watch" eyebrow="A QUICK LOOK AT MOCK CATALOG PRICES" description="A simple local catalog snapshot for popular components; it does not track retailer prices or send alerts.">
      <div className="comparison-table-wrap">
        <table className="comparison-table price-watch-table">
          <thead><tr><th>Component</th><th>Category</th><th>Current mock price</th><th>10% watch target</th><th>Status</th></tr></thead>
          <tbody>{watchParts.map((part) => {
            const price = getPartPrice(part)
            return <tr key={part.id}><th scope="row"><Link to={`/parts/${part.id}`}>{part.brand} {part.name}</Link></th><td>{part.category}</td><td>{currencyFormatter.format(price)}</td><td>{currencyFormatter.format(price * 0.9)}</td><td>{part.outlet ? 'Outlet price' : 'No price alert set'}</td></tr>
          })}</tbody>
        </table>
      </div>
      <p className="help-page__fineprint">All prices shown are local mock data. Watch targets are illustrative only; no notification is set or sent.</p>
    </HelpPage>
  )
}

function HelpPage({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return <Container className="account-page help-page"><header className="destination-page__header"><p className="destination-page__eyebrow">{eyebrow}</p><h1>{title}<span>.</span></h1><p>{description}</p></header>{children}<Link className="help-back-link" to="/build-help">← All build help</Link></Container>
}

function getGpuMemory(part: Part) {
  const memory = String(part.specs.memory ?? '')
  return Number(memory.match(/(\d+(?:\.\d+)?)\s*GB/i)?.[1] ?? 0)
}

export default BuildHelp
