#!/usr/bin/env tsx
/**
 * Script to add unique IDs to all files in the bearbnb tutorial directory.
 * This ensures each documentation file has a distinct ID for Docusaurus.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

const bearbnbDir = path.join(process.cwd(), 'docs', 'tutorials', 'bearbnb')

interface FrontMatter {
  [key: string]: any
}

function parseFrontMatter(content: string): { frontMatter: FrontMatter; body: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    return { frontMatter: {}, body: content }
  }

  const frontMatterText = match[1]
  const body = match[2]

  try {
    const frontMatter = (yaml.load(frontMatterText) as FrontMatter) || {}
    return { frontMatter, body }
  } catch (error) {
    console.error(`Error parsing YAML front matter:`, error)
    return { frontMatter: {}, body: content }
  }
}

function stringifyFrontMatter(frontMatter: FrontMatter): string {
  try {
    return yaml.dump(frontMatter, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    }).trim()
  } catch (error) {
    console.error(`Error stringifying YAML front matter:`, error)
    // Fallback to simple stringification
    const lines: string[] = []
    for (const [key, value] of Object.entries(frontMatter)) {
      if (value === true || value === null) {
        lines.push(`${key}: ${value === null ? 'null' : ''}`)
      } else if (typeof value === 'string') {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`)
      } else {
        lines.push(`${key}: ${JSON.stringify(value)}`)
      }
    }
    return lines.join('\n')
  }
}

function generateIdFromFilename(filename: string): string {
  // Remove extension
  const baseName = filename.replace(/\.(mdx|md)$/, '')
  // Convert to kebab-case if needed and use as ID
  return `bearbnb-${baseName}`
}

function addIdToFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { frontMatter, body } = parseFrontMatter(content)

    // Generate ID from filename
    const filename = path.basename(filePath)
    const id = generateIdFromFilename(filename)

    // Check if ID already exists and matches
    if (frontMatter.id === id) {
      return false // No change needed
    }

    // Add or update the ID
    frontMatter.id = id

    // Reconstruct the file content
    const newFrontMatter = stringifyFrontMatter(frontMatter)
    const newContent = `---\n${newFrontMatter}\n---\n\n${body}`

    fs.writeFileSync(filePath, newContent, 'utf-8')
    return true
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return false
  }
}

function main() {
  if (!fs.existsSync(bearbnbDir)) {
    console.error(`Directory not found: ${bearbnbDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(bearbnbDir)
    .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
    .map(file => path.join(bearbnbDir, file))

  let updatedCount = 0
  for (const filePath of files) {
    if (addIdToFile(filePath)) {
      updatedCount++
      console.log(`Added ID to: ${path.basename(filePath)}`)
    }
  }

  console.log(`\n✅ Updated ${updatedCount} file(s)`)
  if (updatedCount === 0) {
    console.log('All files already have IDs.')
  }
}

main()

