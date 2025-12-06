import { ReactNode, useState, useEffect } from 'react'
import CodeBlock from '@theme/CodeBlock'
import styles from './tab-group.module.css'

interface Tab {
  label: string
  code: string
  language?: string
}

interface TabGroupProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tabLabel: string) => void
}

export default function TabGroup({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabGroupProps) {
  const defaultIndex = defaultTab
    ? tabs.findIndex((tab) => tab.label === defaultTab)
    : 0
  const [internalActiveIndex, setInternalActiveIndex] = useState(
    defaultIndex >= 0 ? defaultIndex : 0
  )

  // If controlled (activeTab prop provided), use that; otherwise use internal state
  const isControlled = controlledActiveTab !== undefined
  const activeIndex = isControlled
    ? tabs.findIndex((tab) => tab.label === controlledActiveTab)
    : internalActiveIndex

  // Update internal state when controlled activeTab changes
  useEffect(() => {
    if (isControlled && activeIndex >= 0) {
      setInternalActiveIndex(activeIndex)
    }
  }, [isControlled, activeIndex])

  if (tabs.length === 0) {
    return null
  }

  const handleTabClick = (index: number, tabLabel: string) => {
    if (isControlled) {
      // If controlled, call the onChange handler
      onTabChange?.(tabLabel)
    } else {
      // If uncontrolled, update internal state
      setInternalActiveIndex(index)
    }
  }

  const activeTab = tabs[activeIndex >= 0 ? activeIndex : 0]

  return (
    <div className={styles.tabGroup}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`${styles.tab} ${
              index === activeIndex ? styles.tabActive : ''
            }`}
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => handleTabClick(index, tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent} role="tabpanel">
        <CodeBlock language={activeTab.language || 'sh'}>
          {activeTab.code}
        </CodeBlock>
      </div>
    </div>
  )
}

