import { ReactNode } from 'react'
import { PackageManagerProvider } from '../components/ui/package-manager-context'

export default function Root({ children }: { children: ReactNode }): ReactNode {
  return <PackageManagerProvider>{children}</PackageManagerProvider>
}

