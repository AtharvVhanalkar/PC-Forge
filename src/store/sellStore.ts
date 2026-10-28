import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  maskPayoutDestination,
  type SellRequestSubmission,
} from '../lib/sellParts.ts'

export type SellRequestData = Omit<SellRequestSubmission, 'payoutDestination'> & {
  payoutDestinationMasked: string
}

export interface SellRequest extends SellRequestData {
  referenceId: string
  submittedAt: string
  status: 'submitted'
}

export interface SellState {
  requests: SellRequest[]
  submitSellRequest: (data: SellRequestSubmission) => string
  getSellRequests: () => SellRequest[]
  getSellRequest: (referenceId: string) => SellRequest | undefined
}

function createSellReference(existingRequests: readonly SellRequest[]): string {
  let referenceId: string

  do {
    const number = Math.floor(10000 + Math.random() * 90000)
    referenceId = `SELL-${number}`
  } while (existingRequests.some((request) => request.referenceId === referenceId))

  return referenceId
}

export const useSellStore = create<SellState>()(
  persist(
    (set, get) => ({
      requests: [],
      submitSellRequest: (data) => {
        if (!data.brand.trim() || !data.model.trim() || !data.sellerName.trim() || !data.email.trim()) {
          throw new RangeError('A sell request must include part and seller details.')
        }

        const { payoutDestination, ...safeData } = data
        const request: SellRequest = {
          ...safeData,
          photoNames: [...data.photoNames],
          payoutDestinationMasked: maskPayoutDestination(payoutDestination),
          referenceId: createSellReference(get().requests),
          submittedAt: new Date().toISOString(),
          status: 'submitted',
        }

        set((state) => ({ requests: [request, ...state.requests] }))
        return request.referenceId
      },
      getSellRequests: () => [...get().requests],
      getSellRequest: (referenceId) =>
        get().requests.find((request) => request.referenceId === referenceId),
    }),
    { name: 'pcforge-sell-requests' },
  ),
)
