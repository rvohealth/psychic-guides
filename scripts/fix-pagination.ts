#!/usr/bin/env node

/**
 * Simple pagination control management for Docusaurus
 *
 * This script processes each directory independently to add pagination controls
 * that prevent navigation from flowing between unrelated sections.
 *
 * Algorithm:
 * 1. Traverse directory hierarchy starting with `docs`
 * 2. For each directory, filter to `.mdx` files only
 * 3. Sort files by sidebar_position (primary) then filename (secondary)
 * 4. Remove pagination controls from all but first/last files
 * 5. Add `pagination_prev: null` to first file
 * 6. Add `pagination_next: null` to last file
 */

import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

interface FrontMatter {
  [key: string]: any
  sidebar_position?: number
  pagination_prev?: string | null
  pagination_next?: string | null
}

interface DocFile {
  filePath: string
  fileName: string
  frontMatter: FrontMatter
  content: string
}

/**
 * Parse front matter from a markdown file
 */
function parseFrontMatter(content: string): { frontMatter: FrontMatter; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    return { frontMatter: {}, body: content }
  }

  try {
    const frontMatter = (yaml.load(match[1]) as FrontMatter) || {}
    return { frontMatter, body: match[2] }
  } catch (error) {
    console.warn(`Failed to parse front matter: ${error}`)
    return { frontMatter: {}, body: content }
  }
}

/**
 * Write front matter and content back to a file
 */
function writeFrontMatter(filePath: string, frontMatter: FrontMatter, body: string): void {
  const frontMatterYaml = yaml
    .dump(frontMatter, {
      flowLevel: -1,
      quotingType: '"',
      forceQuotes: false,
    })
    .trim()

  const newContent = `---\n${frontMatterYaml}\n---\n${body}`
  fs.writeFileSync(filePath, newContent, 'utf8')
}

/**
 * Get all .mdx files in a directory (not recursive)
 */
function getMdxFilesInDirectory(dirPath: string): DocFile[] {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return []
  }

  const files: DocFile[] = []
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const filePath = path.join(dirPath, entry.name)
      const content = fs.readFileSync(filePath, 'utf8')
      const { frontMatter, body } = parseFrontMatter(content)

      files.push({
        filePath,
        fileName: entry.name,
        frontMatter,
        content: body,
      })
    }
  }

  return files
}

/**
 * Sort files by sidebar_position (primary) then filename (secondary)
 */
function sortFiles(files: DocFile[]): DocFile[] {
  return files.sort((a, b) => {
    const aPos = a.frontMatter.sidebar_position
    const bPos = b.frontMatter.sidebar_position

    // Both have positions
    if (aPos !== undefined && bPos !== undefined) {
      if (aPos !== bPos) {
        return aPos - bPos
      }
      // Same position, sort alphabetically by filename
      return a.fileName.localeCompare(b.fileName)
    }

    // Only a has position
    if (aPos !== undefined && bPos === undefined) {
      return -1
    }

    // Only b has position
    if (aPos === undefined && bPos !== undefined) {
      return 1
    }

    // Neither has position, sort alphabetically
    return a.fileName.localeCompare(b.fileName)
  })
}

/**
 * Process a single directory to fix pagination controls
 */
function processDirectory(dirPath: string): void {
  const files = getMdxFilesInDirectory(dirPath)

  if (files.length === 0) {
    return
  }

  const sortedFiles = sortFiles(files)
  const dirName = path.basename(dirPath)

  console.log(`\nProcessing directory: ${dirName}`)
  console.log(`Files in order:`)
  sortedFiles.forEach((file, index) => {
    const pos = file.frontMatter.sidebar_position
    const posStr = pos !== undefined ? `[${pos}]` : '[auto]'
    console.log(`  ${index + 1}. ${posStr} ${file.fileName}`)
  })

  // Process each file
  sortedFiles.forEach((file, index) => {
    const isFirst = index === 0
    const isLast = index === sortedFiles.length - 1

    let changed = false
    const originalPrev = file.frontMatter.pagination_prev
    const originalNext = file.frontMatter.pagination_next

    // Handle pagination_prev
    if (isFirst) {
      // First file should have pagination_prev: null
      if (originalPrev !== null) {
        file.frontMatter.pagination_prev = null
        changed = true
      }
    } else {
      // Non-first files should not have pagination_prev: null
      if (originalPrev === null) {
        delete file.frontMatter.pagination_prev
        changed = true
      }
    }

    // Handle pagination_next
    if (isLast) {
      // Last file should have pagination_next: null
      if (originalNext !== null) {
        file.frontMatter.pagination_next = null
        changed = true
      }
    } else {
      // Non-last files should not have pagination_next: null
      if (originalNext === null) {
        delete file.frontMatter.pagination_next
        changed = true
      }
    }

    if (changed) {
      console.log(`  ✓ Updated: ${file.fileName}`)
      if (isFirst && file.frontMatter.pagination_prev === null) {
        console.log(`    + pagination_prev: null`)
      }
      if (isLast && file.frontMatter.pagination_next === null) {
        console.log(`    + pagination_next: null`)
      }

      writeFrontMatter(file.filePath, file.frontMatter, file.content)
    }
  })
}

/**
 * Recursively traverse directories and process each one
 */
function traverseDirectories(dirPath: string): void {
  // Process current directory
  processDirectory(dirPath)

  // Recursively process subdirectories
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
      const subDirPath = path.join(dirPath, entry.name)
      traverseDirectories(subDirPath)
    }
  }
}

/**
 * Main function
 */
function main(): void {
  console.log('🔧 Fixing pagination controls for each directory...\n')

  const docsDir = path.join(process.cwd(), 'docs')
  traverseDirectories(docsDir)

  console.log('\n✅ Pagination controls have been fixed!')
  console.log('\nRun `pnpm build` to verify the changes.')
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as fixPagination }
