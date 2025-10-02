import React, { useEffect } from 'react'
import './styles.css'

export default function SearchButton() {
  const triggerNativeSearch = () => {
    // Only trigger if our custom search button is visible (not hidden on homepage)
    const customSearchButton = document.querySelector('.search-button') as HTMLElement
    const hiddenSearchButton = document.querySelector('.aa-DetachedSearchButton') as HTMLButtonElement

    if (customSearchButton && hiddenSearchButton) {
      // Check if the button is actually visible
      const isVisible = customSearchButton.offsetParent !== null &&
                       getComputedStyle(customSearchButton).visibility !== 'hidden' &&
                       getComputedStyle(customSearchButton).display !== 'none'

      if (isVisible) {
        hiddenSearchButton.click()
      }
    }
  }

  useEffect(() => {
    // macOS detection and styling
    const isMacOS = navigator.platform.indexOf('Mac') > -1
    if (isMacOS) {
      document.body.classList.add('os-macos')
      setTimeout(() => {
        const searchButton = document.querySelector('.search-button')
        if (searchButton?.parentElement) {
          searchButton.parentElement.classList.add('os-macos')
        }
      }, 100)
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        triggerNativeSearch()
      }

      if (e.key === '/' && !isTyping()) {
        e.preventDefault()
        triggerNativeSearch()
      }

      if (e.key === 'Escape') {
        // Close search modal if it's open
        const searchModal = document.querySelector('.aa-DetachedOverlay') as HTMLElement
        if (searchModal && getComputedStyle(searchModal).display !== 'none') {
          const cancelButton = searchModal.querySelector('.aa-DetachedCancelButton') as HTMLButtonElement
          if (cancelButton) {
            cancelButton.click()
          }
        }
      }
    }

    function isTyping() {
      const activeElement = document.activeElement
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable
      )
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <button
      className="search-button"
      onClick={triggerNativeSearch}
      aria-label="Search"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24">
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        />
      </svg>
      <kbd className="search-button-key macos">⌘K</kbd>
      <kbd className="search-button-key non-macos">Ctrl K</kbd>
    </button>
  )
}
