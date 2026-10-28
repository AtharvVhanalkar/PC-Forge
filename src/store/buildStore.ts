import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildPresets,
  type BuildColorTheme,
  type BuildComponentCategory,
  type BuildDraft,
  type CableManagement,
  type OperatingSystem,
} from '../lib/customBuild.ts'

export interface BuildState extends BuildDraft {
  setPart: (category: BuildComponentCategory, partId: string | null) => void
  goToStep: (step: number) => void
  setPreset: (presetId: string) => void
  setExtraFans: (partIds: string[]) => void
  setOperatingSystem: (operatingSystem: OperatingSystem) => void
  setExtendedWarranty: (enabled: boolean) => void
  setRgbLighting: (enabled: boolean) => void
  setCableManagement: (style: CableManagement) => void
  setColorTheme: (theme: BuildColorTheme) => void
  resetBuild: () => void
}

const initialDraft: BuildDraft = {
  selectedPartIds: {},
  currentStep: 0,
  presetId: null,
  extraFanIds: [],
  operatingSystem: 'none',
  extendedWarranty: false,
  rgbLighting: false,
  cableManagement: 'standard',
  colorTheme: 'Scarlet',
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set) => ({
      ...initialDraft,
      setPart: (category, partId) =>
        set((state) => ({
          selectedPartIds: {
            ...state.selectedPartIds,
            ...(partId ? { [category]: partId } : {}),
            ...(!partId ? { [category]: undefined } : {}),
          },
          presetId: null,
        })),
      goToStep: (step) =>
        set({ currentStep: Math.max(0, Math.min(9, Math.trunc(step))) }),
      setPreset: (presetId) => {
        const preset = buildPresets.find((candidate) => candidate.id === presetId)
        if (!preset) throw new RangeError(`Unknown PC build preset "${presetId}".`)

        set({
          selectedPartIds: { ...preset.selectedPartIds },
          currentStep: 0,
          presetId,
          extraFanIds: [],
          operatingSystem: 'none',
          extendedWarranty: false,
          rgbLighting: false,
          cableManagement: 'standard',
          colorTheme: preset.colorTheme,
        })
      },
      setExtraFans: (partIds) => set({ extraFanIds: [...new Set(partIds)].slice(0, 3) }),
      setOperatingSystem: (operatingSystem) => set({ operatingSystem }),
      setExtendedWarranty: (extendedWarranty) => set({ extendedWarranty }),
      setRgbLighting: (rgbLighting) => set({ rgbLighting }),
      setCableManagement: (cableManagement) => set({ cableManagement }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      resetBuild: () => set({ ...initialDraft }),
    }),
    {
      name: 'pcforge-build-draft',
      version: 1,
      partialize: (state) => ({
        selectedPartIds: state.selectedPartIds,
        currentStep: state.currentStep,
        presetId: state.presetId,
        extraFanIds: state.extraFanIds,
        operatingSystem: state.operatingSystem,
        extendedWarranty: state.extendedWarranty,
        rgbLighting: state.rgbLighting,
        cableManagement: state.cableManagement,
        colorTheme: state.colorTheme,
      }),
    },
  ),
)
