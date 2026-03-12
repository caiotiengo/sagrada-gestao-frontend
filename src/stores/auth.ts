import { create } from 'zustand'
import { onIdTokenChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import type { LoginResponse, HouseMembership, UserRole } from '@/types'
import { USER_STORAGE_KEY } from '@/constants'

const PROFILE_STORAGE_KEY = USER_STORAGE_KEY
const HOUSE_STORAGE_KEY = 'sagrada_current_house'
/** Max age for cached profile before forcing a refresh (30 min) */
const PROFILE_MAX_AGE_MS = 30 * 60 * 1000

interface StoredProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  photoUrl: string | null
  houses: HouseMembership[]
  storedAt: number
}

interface UserProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  photoUrl: string | null
  houses: HouseMembership[]
}

interface AuthState {
  firebaseUser: FirebaseUser | null
  profile: UserProfile | null
  currentHouse: HouseMembership | null
  isAuthenticated: boolean
  isLoading: boolean
  isProfileStale: boolean

  setFirebaseUser: (user: FirebaseUser | null) => void
  setProfile: (profile: LoginResponse, selectHouseId?: string) => void
  setCurrentHouse: (house: HouseMembership) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  hydrate: () => () => void

  // Derived helpers
  currentRole: () => UserRole | null
  currentHouseId: () => string | null
  currentMemberId: () => string | null
  isAdmin: () => boolean
  hasPermission: (permission: string) => boolean
}

function persistProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return
  const stored: StoredProfile = { ...profile, storedAt: Date.now() }
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(stored))
}

function persistCurrentHouse(house: HouseMembership | null) {
  if (typeof window === 'undefined') return
  if (house) {
    localStorage.setItem(HOUSE_STORAGE_KEY, JSON.stringify(house))
  } else {
    localStorage.removeItem(HOUSE_STORAGE_KEY)
  }
}

function loadStoredProfile(): { profile: UserProfile; isStale: boolean } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw) as StoredProfile
    const age = Date.now() - (stored.storedAt || 0)
    const isStale = age > PROFILE_MAX_AGE_MS
    const { storedAt: _, ...profile } = stored
    return { profile, isStale }
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    return null
  }
}

function loadStoredHouse(): HouseMembership | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(HOUSE_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as HouseMembership
  } catch {
    localStorage.removeItem(HOUSE_STORAGE_KEY)
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  profile: null,
  currentHouse: null,
  isAuthenticated: false,
  isLoading: true,
  isProfileStale: false,

  setFirebaseUser: (firebaseUser) => {
    set({
      firebaseUser,
      isAuthenticated: !!firebaseUser,
      isLoading: false,
    })
  },

  setProfile: (data, selectHouseId) => {
    const profile: UserProfile = {
      uid: data.uid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      photoUrl: data.photoUrl,
      houses: data.houses,
    }

    persistProfile(profile)

    // Determine which house to select:
    // 1. If selectHouseId is provided, use that (e.g. after registration)
    // 2. If a house is already selected and still exists in the profile, keep it
    // 3. Otherwise, fall back to the first house
    let currentHouse: HouseMembership | null = null

    if (selectHouseId) {
      currentHouse = data.houses.find((h) => h.houseId === selectHouseId) ?? null
    }

    if (!currentHouse) {
      const existing = get().currentHouse
      if (existing) {
        // Re-resolve from fresh data to get updated permissions/role
        currentHouse = data.houses.find((h) => h.houseId === existing.houseId) ?? null
      }
    }

    if (!currentHouse) {
      currentHouse = data.houses[0] ?? null
    }

    persistCurrentHouse(currentHouse)
    set({ profile, currentHouse, isProfileStale: false })
  },

  setCurrentHouse: (house) => {
    persistCurrentHouse(house)
    set({ currentHouse: house })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      localStorage.removeItem(HOUSE_STORAGE_KEY)
    }
    set({
      firebaseUser: null,
      profile: null,
      currentHouse: null,
      isAuthenticated: false,
      isLoading: false,
      isProfileStale: false,
    })
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrate: () => {
    // Use onIdTokenChanged to also catch token refreshes
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Restore profile from localStorage while we fetch fresh data
        const stored = loadStoredProfile()
        const storedHouse = loadStoredHouse()

        if (stored) {
          // If a house was persisted, match it from the profile houses
          let currentHouse = get().currentHouse
          if (!currentHouse && storedHouse) {
            currentHouse =
              stored.profile.houses.find((h) => h.houseId === storedHouse.houseId) ??
              stored.profile.houses[0] ??
              null
          }
          if (!currentHouse) {
            currentHouse = stored.profile.houses[0] ?? null
          }

          set({
            firebaseUser,
            profile: stored.profile,
            currentHouse,
            isAuthenticated: true,
            isLoading: false,
            isProfileStale: stored.isStale,
          })
        } else {
          set({
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
            isProfileStale: true,
          })
        }
      } else {
        // Signed out
        if (typeof window !== 'undefined') {
          localStorage.removeItem(PROFILE_STORAGE_KEY)
          localStorage.removeItem(HOUSE_STORAGE_KEY)
        }
        set({
          firebaseUser: null,
          profile: null,
          currentHouse: null,
          isAuthenticated: false,
          isLoading: false,
          isProfileStale: false,
        })
      }
    })

    return unsubscribe
  },

  // Derived helpers
  currentRole: () => get().currentHouse?.role ?? null,
  currentHouseId: () => get().currentHouse?.houseId ?? null,
  currentMemberId: () => get().currentHouse?.memberId ?? null,

  isAdmin: () => {
    return get().currentHouse?.role === 'admin'
  },

  hasPermission: (permission: string) => {
    const house = get().currentHouse
    if (!house) return false
    if (house.role === 'admin') return true
    return house.extraPermissions.includes(permission as never)
  },
}))
