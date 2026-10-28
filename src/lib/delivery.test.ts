/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { parts } from '../data/parts.ts'
import { prebuilts } from '../data/prebuilts.ts'
import {
  getCartEta,
  getItemEta,
  type CustomBuildDeliveryItem,
} from './delivery.ts'

const referenceDate = new Date(2026, 9, 28, 12)

function partById(id: string) {
  const part = parts.find((item) => item.id === id)
  assert.ok(part, `Expected mock part "${id}" to exist`)
  return part
}

function prebuiltById(id: string) {
  const prebuilt = prebuilts.find((item) => item.id === id)
  assert.ok(prebuilt, `Expected mock prebuilt "${id}" to exist`)
  return prebuilt
}

test('in-stock parts and prebuilts have a 4-day ETA', () => {
  const partEta = getItemEta(partById('cpu-ryzen-7-9800x3d'), referenceDate)
  const prebuiltEta = getItemEta(prebuiltById('scarlet-fury'), referenceDate)

  assert.equal(partEta.days, 4)
  assert.equal(partEta.label, 'Arrives by Mon, 2 Nov')
  assert.equal(prebuiltEta.days, 4)
  assert.equal(prebuiltEta.arrivalDate.getDay(), 1)
})

test('low-stock, made-to-order, and large items have a 6-day ETA', () => {
  assert.equal(
    getItemEta(partById('cpu-ryzen-5-9600x'), referenceDate).days,
    6,
  )
  assert.equal(
    getItemEta(prebuiltById('titan-forge'), referenceDate).days,
    6,
  )
  assert.equal(
    getItemEta(partById('case-north-xl'), referenceDate).days,
    6,
  )
  assert.equal(
    getItemEta(partById('monitor-lg-27gr83q'), referenceDate).days,
    6,
  )
})

test('custom builds have the maximum 10-day ETA', () => {
  const customBuild: CustomBuildDeliveryItem = {
    kind: 'custom-build',
    id: 'my-custom-pc',
  }

  assert.equal(getItemEta(customBuild, referenceDate).days, 10)
  assert.equal(getItemEta(customBuild, referenceDate).arrivalDate.getDay(), 1)
})

test('a mixed cart uses the longest ETA and express does not change it', () => {
  const expressPart = {
    ...partById('cpu-ryzen-7-9800x3d'),
    express: true,
  }
  const customBuild: CustomBuildDeliveryItem = {
    kind: 'custom-build',
    id: 'my-custom-pc',
  }
  const eta = getCartEta(
    [expressPart, partById('case-north-xl')],
    referenceDate,
  )
  const customCartEta = getCartEta(
    [expressPart, customBuild],
    referenceDate,
  )

  assert.equal(getItemEta(expressPart, referenceDate).days, 4)
  assert.equal(getCartEta([expressPart], referenceDate).days, 4)
  assert.equal(eta.days, 6)
  assert.equal(eta.label, 'Arrives by Wed, 4 Nov')
  assert.equal(customCartEta.days, 10)
})

test('a Sunday is skipped while calculating the arrival date', () => {
  const sunday = new Date(2026, 10, 1, 12)
  const eta = getItemEta(partById('cpu-ryzen-7-9800x3d'), sunday)

  assert.equal(eta.arrivalDate.getDay(), 4)
  assert.equal(eta.label, 'Arrives by Thu, 5 Nov')
})

test('an empty cart cannot produce an ETA', () => {
  assert.throws(() => getCartEta([], referenceDate), {
    name: 'RangeError',
  })
})
