import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PackageManagerContextType {
  selectedPackageManager: 'pnpm' | 'npm' | 'yarn'
  setSelectedPackageManager: (pm: 'pnpm' | 'npm' | 'yarn') => void
}

const PackageManagerContext = createContext<PackageManagerContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'psychic-docs-package-manager'

export function PackageManagerProvider({ children }: { children: ReactNode }) {
  const [selectedPackageManager, setSelectedPackageManagerState] = useState<
    'pnpm' | 'npm' | 'yarn'
  >('pnpm')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'pnpm' || stored === 'npm' || stored === 'yarn') {
      setSelectedPackageManagerState(stored)
    }
  }, [])

  // Save to localStorage when selection changes
  const setSelectedPackageManager = (pm: 'pnpm' | 'npm' | 'yarn') => {
    setSelectedPackageManagerState(pm)
    localStorage.setItem(STORAGE_KEY, pm)
  }

  return (
    <PackageManagerContext.Provider
      value={{ selectedPackageManager, setSelectedPackageManager }}
    >
      {children}
    </PackageManagerContext.Provider>
  )
}

export function usePackageManager() {
  const context = useContext(PackageManagerContext)
  
  // Always call hooks (rules of hooks)
  const [localSelectedPackageManager, setLocalSelectedPackageManager] = useState<
    'pnpm' | 'npm' | 'yarn'
  >(() => {
    // Initialize from localStorage only if context is not available
    if (context === undefined && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'pnpm' || stored === 'npm' || stored === 'yarn') {
        return stored
      }
    }
    return 'pnpm'
  })

  // If context is available, use it (preferred - syncs across all instances)
  if (context !== undefined) {
    return context
  }

  // Fallback: use local state (works standalone but won't sync across instances)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'pnpm' || stored === 'npm' || stored === 'yarn') {
        setLocalSelectedPackageManager(stored)
      }
    }
  }, [])

  const setSelectedPackageManager = (pm: 'pnpm' | 'npm' | 'yarn') => {
    setLocalSelectedPackageManager(pm)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, pm)
    }
  }

  return {
    selectedPackageManager: localSelectedPackageManager,
    setSelectedPackageManager,
  }
}

