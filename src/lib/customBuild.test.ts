import assert from 'node:assert/strict'
import test from 'node:test'
import { parts } from '../data/parts.ts'
import {
  buildPresets,
  getBuildValidationIssues,
  getBuildWattage,
  getPartCompatibilityIssues,
} from './customBuild.ts'

test('all included presets resolve to compatible full builds', () => {
  for (const preset of buildPresets) {
    assert.deepEqual(getBuildValidationIssues(preset.selectedPartIds), [], preset.name)
  }
})

test('reports socket mismatch between a CPU and selected motherboard', () => {
  const cpu = parts.find((part) => part.id === 'cpu-core-ultra-9-285k')
  assert.ok(cpu)
  const issues = getPartCompatibilityIssues(cpu, {
    CPU: 'cpu-core-ultra-9-285k',
    Motherboard: 'mb-b650m-pro',
  })

  assert.ok(issues.some((issue) => issue.includes('Socket mismatch')))
})

test('reports memory type mismatch clearly', () => {
  const ram = parts.find((part) => part.id === 'ram-vengeance-32-ddr5')
  const motherboard = parts.find((part) => part.id === 'mb-b650m-pro')
  assert.ok(ram)
  assert.ok(motherboard)
  const incompatibleRam = {
    ...ram,
    compatibility: { ...ram.compatibility, ramType: 'DDR4' },
  }

  assert.equal(getPartCompatibilityIssues(incompatibleRam, {
    Motherboard: motherboard.id,
  })[0]?.startsWith('RAM type mismatch'), true)
})

test('reports an oversized graphics card for the selected case', () => {
  const gpu = parts.find((part) => part.id === 'gpu-rtx-5080')
  assert.ok(gpu)
  const issues = getPartCompatibilityIssues(gpu, {
    GPU: gpu.id,
    Case: 'case-ap201',
  })

  assert.ok(issues.some((issue) => issue.includes('GPU too long')))
})

test('reports insufficient PSU headroom and estimates CPU/GPU draw', () => {
  const ids = {
    CPU: 'cpu-ryzen-5-7600',
    GPU: 'gpu-rtx-5090',
    PSU: 'psu-focus-gx850',
  }
  const psu = parts.find((part) => part.id === ids.PSU)
  assert.ok(psu)
  assert.equal(getBuildWattage(ids), 740)
  assert.ok(getPartCompatibilityIssues(psu, ids).some((issue) => issue.includes('PSU too weak')))
})
