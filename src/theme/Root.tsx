import { ReactNode, useEffect } from 'react'
import { PackageManagerProvider } from '../components/ui/package-manager-context'

export default function Root({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    // we need to hide breadcrumbs unless we are at least one page deep into
    // our docs, so as not to redundantly render, i.e. "Welcome" both as a breadcrumb
    // and as a heading, causing the word to show twice. Unfortunately, the css rules
    // are too complex given the nature of the way docusaurus lays out breadcrumb html,
    // so we are forced to do this in react instead.
    const hideSingleBreadcrumb = () => {
      const breadcrumbContainers = document.querySelectorAll(
        'nav.breadcrumbs, .breadcrumbs, nav[aria-label*="breadcrumb" i]'
      )
      
      breadcrumbContainers.forEach((container) => {
        const list = container.querySelector('.breadcrumbs__list') || container.querySelector('ul')
        if (!list) return
        
        const items = Array.from(list.querySelectorAll('.breadcrumbs__item, li'))
        
        // Count only visible items (not hidden with display: none), since docusaurus
        // will inject hidden breadcrumb items to throw off our counting.
        const visibleItems = items.filter((item) => {
          const style = window.getComputedStyle(item)
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
        })
        
        // If there's only one visible item (or no visible items), hide the breadcrumbs
        if (visibleItems.length <= 1) {
          ;(container as HTMLElement).style.setProperty('display', 'none', 'important')
        } else {
          // Make sure it's visible if there are multiple items
          ;(container as HTMLElement).style.removeProperty('display')
        }
      })
    }

    hideSingleBreadcrumb()
    
    // begin: add mutaton observer to call our function when the content changes
    const observer = new MutationObserver(() => {
      hideSingleBreadcrumb()
    })
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => {
      observer.disconnect()
    }
    // end: add mutaton observer to call our function when the content changes
  }, [])

  return <PackageManagerProvider>{children}</PackageManagerProvider>
}

