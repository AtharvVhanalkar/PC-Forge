import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LocalAccount {
  name: string
  email: string
}

export interface AuthState {
  account: LocalAccount | null
  accounts: LocalAccount[]
  register: (name: string, email: string) => boolean
  login: (email: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      accounts: [],
      register: (name, email) => {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedName = name.trim()
        if (!normalizedEmail || !normalizedName) return false
        if (get().accounts.some((account) => account.email === normalizedEmail)) return false

        const account = { name: normalizedName, email: normalizedEmail }
        set((state) => ({ account, accounts: [...state.accounts, account] }))
        return true
      },
      login: (email) => {
        const account = get().accounts.find(
          (savedAccount) => savedAccount.email === email.trim().toLowerCase(),
        )
        if (!account) return false
        set({ account })
        return true
      },
      logout: () => set({ account: null }),
    }),
    { name: 'pcforge-local-account' },
  ),
)
