import { estimateTotalWattage, isCaseFitsGpu, isCpuMotherboardCompatible, isPsuEnough, isRamCompatible } from '../data/compatibility.ts'
import { parts, type Part, type PartCategory } from '../data/parts.ts'
import { getPartPrice } from './partsCatalog.ts'

export const buildComponentCategories = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
] as const satisfies readonly PartCategory[]

export type BuildComponentCategory = (typeof buildComponentCategories)[number]
export type CableManagement = 'standard' | 'premium'
export type BuildColorTheme = 'Scarlet' | 'Midnight' | 'Frost' | 'Graphite'
export type OperatingSystem = 'none' | 'Windows 11 Home' | 'Windows 11 Pro'

export interface BuildDraft {
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>
  currentStep: number
  presetId: string | null
  extraFanIds: string[]
  operatingSystem: OperatingSystem
  extendedWarranty: boolean
  rgbLighting: boolean
  cableManagement: CableManagement
  colorTheme: BuildColorTheme
}

export interface BuildPreset {
  id: string
  name: string
  description: string
  selectedPartIds: Record<BuildComponentCategory, string>
  colorTheme: BuildColorTheme
}

export const CUSTOM_BUILD_ASSEMBLY_FEE = 199
export const PREMIUM_CABLE_MANAGEMENT_FEE = 50
export const EXTENDED_WARRANTY_PRICE = 99
export const WINDOWS_HOME_PRICE = 129
export const WINDOWS_PRO_PRICE = 179

function supportsFormFactor(caseFormFactor: string, boardFormFactor: string): boolean {
  const formFactorSize: Record<string, number> = {
    'Mini-ITX': 0,
    'Micro-ATX': 1,
    ATX: 2,
    'E-ATX': 3,
  }
  const caseSize = formFactorSize[caseFormFactor]
  const boardSize = formFactorSize[boardFormFactor]
  return caseSize !== undefined && boardSize !== undefined && caseSize >= boardSize
}

export const buildSteps = [
  { title: 'CPU', category: 'CPU', hint: 'Pick the heart of your system.' },
  { title: 'Motherboard', category: 'Motherboard', hint: 'Match the processor socket and platform.' },
  { title: 'RAM', category: 'RAM', hint: 'Choose memory supported by your board.' },
  { title: 'GPU', category: 'GPU', hint: 'Set your gaming or creative performance.' },
  { title: 'Storage', category: 'Storage', hint: 'Choose fast, reliable room for everything.' },
  { title: 'PSU', category: 'PSU', hint: 'Leave enough headroom for your components.' },
  { title: 'Case', category: 'Case', hint: 'Check board fit and graphics-card clearance.' },
  { title: 'Cooling', category: 'Cooling', hint: 'Keep your system cool and composed.' },
  { title: 'Extras', category: null, hint: 'Add fans, software, and peace of mind.' },
  { title: 'Review', category: null, hint: 'Check your build before adding it to your cart.' },
] as const

const initialPartIds: Record<BuildComponentCategory, string> = {
  CPU: 'cpu-ryzen-5-7600',
  Motherboard: 'mb-b650m-pro',
  RAM: 'ram-vengeance-32-ddr5',
  GPU: 'gpu-rtx-5070',
  Storage: 'ssd-990pro-2tb',
  PSU: 'psu-focus-gx850',
  Case: 'case-lancool-216',
  Cooling: 'cooler-peerless-assassin',
}

export const buildPresets: BuildPreset[] = [
  {
    id: '1080p-esports',
    name: '1080p Esports',
    description: 'High-refresh competitive gaming with a balanced, upgrade-ready platform.',
    selectedPartIds: { ...initialPartIds },
    colorTheme: 'Scarlet',
  },
  {
    id: '1440p-gaming',
    name: '1440p Gaming',
    description: 'A powerful high-refresh setup with extra graphics and memory headroom.',
    selectedPartIds: {
      CPU: 'cpu-ryzen-7-9800x3d',
      Motherboard: 'mb-b850-aorus-elite',
      RAM: 'ram-vengeance-32-ddr5',
      GPU: 'gpu-rtx-5080',
      Storage: 'ssd-990pro-2tb',
      PSU: 'psu-rm1000x',
      Case: 'case-lancool-216',
      Cooling: 'cooler-arctic-360',
    },
    colorTheme: 'Midnight',
  },
  {
    id: '4k-creator',
    name: '4K Creator',
    description: 'More CPU threads, memory, storage, and GPU power for demanding workflows.',
    selectedPartIds: {
      CPU: 'cpu-ryzen-9-9950x',
      Motherboard: 'mb-x870e-ace',
      RAM: 'ram-vengeance-96-ddr5',
      GPU: 'gpu-rtx-5090',
      Storage: 'ssd-t700-2tb',
      PSU: 'psu-prime-tx1300',
      Case: 'case-north-xl',
      Cooling: 'cooler-kraken-360',
    },
    colorTheme: 'Frost',
  },
]

export function getSelectedParts(
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>,
): Part[] {
  return buildComponentCategories.flatMap((category) => {
    const id = selectedPartIds[category]
    const part = parts.find((candidate) => candidate.id === id)
    return part ? [part] : []
  })
}

export function getBuildWattage(
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>,
): number {
  const powerComponents = getSelectedParts(selectedPartIds).filter(
    (part) => part.category === 'CPU' || part.category === 'GPU',
  )
  return estimateTotalWattage(powerComponents)
}

export function getPartCompatibilityIssues(
  candidate: Part,
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>,
): string[] {
  const selectedParts = getSelectedParts(selectedPartIds)
  const currentCpu = selectedParts.find((part) => part.category === 'CPU')
  const currentMotherboard = selectedParts.find((part) => part.category === 'Motherboard')
  const currentRam = selectedParts.find((part) => part.category === 'RAM')
  const currentGpu = selectedParts.find((part) => part.category === 'GPU')
  const currentPsu = selectedParts.find((part) => part.category === 'PSU')
  const currentCase = selectedParts.find((part) => part.category === 'Case')
  const issues: string[] = []

  if (candidate.category === 'Motherboard' && currentCpu && !isCpuMotherboardCompatible(currentCpu, candidate)) {
    issues.push(`Socket mismatch: this board uses ${candidate.compatibility.cpuSocket ?? 'an unknown socket'}, but the selected CPU uses ${currentCpu.compatibility.cpuSocket ?? 'a different socket'}.`)
  }
  if (candidate.category === 'CPU' && currentMotherboard && !isCpuMotherboardCompatible(candidate, currentMotherboard)) {
    issues.push(`Socket mismatch: this CPU uses ${candidate.compatibility.cpuSocket ?? 'an unknown socket'}, but the selected board uses ${currentMotherboard.compatibility.cpuSocket ?? 'a different socket'}.`)
  }
  if (candidate.category === 'RAM' && currentMotherboard && !isRamCompatible(candidate, currentMotherboard)) {
    issues.push(`RAM type mismatch: this memory is ${candidate.compatibility.ramType ?? 'unspecified'}, but the selected board supports ${currentMotherboard.compatibility.ramType ?? 'a different type'}.`)
  }
  if (candidate.category === 'Motherboard' && currentRam && !isRamCompatible(currentRam, candidate)) {
    issues.push(`RAM type mismatch: this board supports ${candidate.compatibility.ramType ?? 'unspecified'}, but the selected memory is ${currentRam.compatibility.ramType ?? 'a different type'}.`)
  }

  if (candidate.category === 'Case' && currentGpu && !isCaseFitsGpu(candidate, currentGpu)) {
    issues.push(`GPU too long: this case supports up to ${candidate.compatibility.maxGpuLengthMm ?? 'an unspecified'} mm, while the selected GPU is ${currentGpu.compatibility.gpuLengthMm ?? 'an unspecified'} mm.`)
  }
  if (candidate.category === 'GPU' && currentCase && !isCaseFitsGpu(currentCase, candidate)) {
    issues.push(`GPU too long: this card is ${candidate.compatibility.gpuLengthMm ?? 'an unspecified'} mm, while the selected case supports up to ${currentCase.compatibility.maxGpuLengthMm ?? 'an unspecified'} mm.`)
  }
  if (candidate.category === 'Case' && currentMotherboard) {
    const supportedFormFactor = candidate.compatibility.motherboardFormFactor
    const motherboardFormFactor = currentMotherboard.compatibility.motherboardFormFactor
    if (supportedFormFactor && motherboardFormFactor && !supportsFormFactor(supportedFormFactor, motherboardFormFactor)) {
      issues.push(`Motherboard form factor mismatch: this case supports up to ${supportedFormFactor}, but the selected board is ${motherboardFormFactor}.`)
    }
  }
  if (candidate.category === 'Motherboard' && currentCase) {
    const supportedFormFactor = currentCase.compatibility.motherboardFormFactor
    const motherboardFormFactor = candidate.compatibility.motherboardFormFactor
    if (supportedFormFactor && motherboardFormFactor && !supportsFormFactor(supportedFormFactor, motherboardFormFactor)) {
      issues.push(`Motherboard form factor mismatch: this board is ${motherboardFormFactor}, but the selected case supports up to ${supportedFormFactor}.`)
    }
  }

  if (candidate.category === 'PSU') {
    const requiredWattage = getBuildWattage(selectedPartIds)
    if (!isPsuEnough(requiredWattage, candidate)) {
      issues.push(`PSU too weak: this build needs at least ${Math.ceil(requiredWattage * 1.25)} W with a 25% headroom margin.`)
    }
  } else if (currentPsu) {
    const selectedWithCandidate = {
      ...selectedPartIds,
      [candidate.category]: candidate.id,
    }
    const requiredWattage = getBuildWattage(selectedWithCandidate)
    if (!isPsuEnough(requiredWattage, currentPsu)) {
      issues.push(`PSU too weak: this combination needs at least ${Math.ceil(requiredWattage * 1.25)} W, but the selected PSU is ${currentPsu.compatibility.psuWattage ?? 'an unspecified'} W.`)
    }
  }

  return issues
}

export function getBuildValidationIssues(
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>,
): string[] {
  const selected = getSelectedParts(selectedPartIds)
  const issues = buildComponentCategories
    .flatMap((category) => selectedPartIds[category] ? [] : [`Choose a ${category.toLowerCase()}.`])
  const selectedByCategory = (category: BuildComponentCategory) =>
    selected.find((part) => part.category === category)

  for (const part of selected) {
    issues.push(...getPartCompatibilityIssues(part, selectedPartIds)
      .filter((issue) => {
        if (part.category === 'CPU') return issue.startsWith('Socket mismatch') || issue.startsWith('PSU too weak')
        if (part.category === 'Motherboard') return issue.startsWith('Socket mismatch') || issue.startsWith('RAM type mismatch') || issue.startsWith('Motherboard form factor mismatch')
        if (part.category === 'RAM') return issue.startsWith('RAM type mismatch')
        if (part.category === 'GPU') return issue.startsWith('GPU too long') || issue.startsWith('PSU too weak')
        if (part.category === 'Case') return issue.startsWith('GPU too long') || issue.startsWith('Motherboard form factor mismatch')
        return false
      }))
  }

  const motherboard = selectedByCategory('Motherboard')
  const ram = selectedByCategory('RAM')
  if (ram && motherboard && !isRamCompatible(ram, motherboard) && !issues.some((issue) => issue.startsWith('RAM type mismatch'))) {
    issues.push(`RAM type mismatch: ${ram.compatibility.ramType ?? 'selected memory'} is incompatible with ${motherboard.compatibility.ramType ?? 'the selected motherboard'}.`)
  }

  const gpu = selectedByCategory('GPU')
  const casePart = selectedByCategory('Case')
  if (gpu && casePart && !isCaseFitsGpu(casePart, gpu) && !issues.some((issue) => issue.startsWith('GPU too long'))) {
    issues.push(`GPU too long: ${gpu.name} does not fit inside ${casePart.name}.`)
  }

  const psu = selectedByCategory('PSU')
  if (psu && !isPsuEnough(getBuildWattage(selectedPartIds), psu) && !issues.some((issue) => issue.startsWith('PSU too weak'))) {
    issues.push(`PSU too weak: the selected ${psu.name} cannot provide enough power for this build.`)
  }

  return [...new Set(issues)]
}

export function getBuildPartsPrice(selectedPartIds: Partial<Record<BuildComponentCategory, string>>): number {
  return getSelectedParts(selectedPartIds).reduce((total, part) => total + getPartPrice(part), 0)
}

export function getSelectedPartForCategory(
  category: BuildComponentCategory,
  selectedPartIds: Partial<Record<BuildComponentCategory, string>>,
): Part | undefined {
  return parts.find((part) => part.id === selectedPartIds[category])
}
