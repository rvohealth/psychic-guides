import TabGroup from './tab-group'
import { usePackageManager } from './package-manager-context'

interface PackageManagerTabsProps {
  code: string
  language?: 'ts' | 'sh'
  defaultTab?: 'pnpm' | 'npm' | 'yarn'
}

export default function PackageManagerTabs({
  code,
  language = 'sh',
  defaultTab,
}: PackageManagerTabsProps) {
  const { selectedPackageManager, setSelectedPackageManager } = usePackageManager()
  const packageManagers = [
    { label: 'pnpm', value: 'pnpm' },
    { label: 'yarn', value: 'yarn' },
    { label: 'npm', value: 'npm run' },
  ]

  const tabs = packageManagers.map((pm) => ({
    label: pm.label,
    code: code.replace(/\{\{PM\}\}/g, pm.value),
    language,
  }))

  // Use the shared selected package manager, or fall back to defaultTab if provided
  const activeTab = defaultTab || selectedPackageManager

  const handleTabChange = (tabLabel: string) => {
    if (tabLabel === 'pnpm' || tabLabel === 'npm' || tabLabel === 'yarn') {
      setSelectedPackageManager(tabLabel)
    }
  }

  return (
    <TabGroup
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  )
}

