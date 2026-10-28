import type { Part } from './parts'

function isCategory(part: Part, category: Part['category']): boolean {
  return part.category === category
}

export function isCpuMotherboardCompatible(cpu: Part, motherboard: Part): boolean {
  if (!isCategory(cpu, 'CPU') || !isCategory(motherboard, 'Motherboard')) {
    return false
  }

  const cpuSocket = cpu.compatibility.cpuSocket
  const motherboardSocket = motherboard.compatibility.cpuSocket
  return Boolean(cpuSocket && motherboardSocket && cpuSocket === motherboardSocket)
}

export function isRamCompatible(ram: Part, motherboard: Part): boolean {
  if (!isCategory(ram, 'RAM') || !isCategory(motherboard, 'Motherboard')) {
    return false
  }

  const ramType = ram.compatibility.ramType
  const motherboardRamType = motherboard.compatibility.ramType
  return Boolean(ramType && motherboardRamType && ramType === motherboardRamType)
}

export function isCaseFitsGpu(casePart: Part, gpu: Part): boolean {
  if (!isCategory(casePart, 'Case') || !isCategory(gpu, 'GPU')) {
    return false
  }

  const maxGpuLength = casePart.compatibility.maxGpuLengthMm
  const gpuLength = gpu.compatibility.gpuLengthMm
  return maxGpuLength !== undefined && gpuLength !== undefined && gpuLength <= maxGpuLength
}

export function isPsuEnough(totalTdp: number, psu: Part): boolean {
  if (!isCategory(psu, 'PSU') || !Number.isFinite(totalTdp) || totalTdp < 0) {
    return false
  }

  const psuWattage = psu.compatibility.psuWattage
  return psuWattage !== undefined && psuWattage >= Math.ceil(totalTdp * 1.25)
}

export function estimateTotalWattage(selectedParts: readonly Part[]): number {
  const componentTdp = selectedParts.reduce(
    (total, part) => total + (part.compatibility.tdp ?? 0),
    0,
  )

  return componentTdp + (selectedParts.length > 0 ? 100 : 0)
}
