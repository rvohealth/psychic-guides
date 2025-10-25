#!/usr/bin/env tsx

import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

interface FrontMatter {
  title?: string
  sidebar_position?: number
  pagination_prev?: string | null
  pagination_next?: string | null
  [key: string]: any
}

interface DocFile {
  path: string
  title: string
  content: string
  frontMatter: FrontMatter
  sidebarPosition: number
  directory: string
}

function extractFrontMatter(content: string): { frontMatter: FrontMatter; content: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    return { frontMatter: {}, content }
  }

  try {
    const frontMatter = (yaml.load(match[1]) as FrontMatter) || {}
    return { frontMatter, content: match[2] }
  } catch (error) {
    console.warn(`Failed to parse front matter: ${error}`)
    return { frontMatter: {}, content }
  }
}

function getAllDocFiles(docsDir: string): DocFile[] {
  const files: DocFile[] = []

  function traverseDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        traverseDirectory(fullPath)
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const { frontMatter, content: bodyContent } = extractFrontMatter(content)

        const relativePath = path.relative(docsDir, fullPath)
        const directory = path.dirname(relativePath)

        files.push({
          path: relativePath,
          title: frontMatter.title || path.basename(entry.name, path.extname(entry.name)),
          content: bodyContent,
          frontMatter,
          sidebarPosition: frontMatter.sidebar_position || 999,
          directory: directory === '.' ? 'root' : directory,
        })
      }
    }
  }

  traverseDirectory(docsDir)
  return files
}

function sortFilesByStructure(files: DocFile[]): DocFile[] {
  // Group by directory
  const grouped = files.reduce((acc, file) => {
    if (!acc[file.directory]) {
      acc[file.directory] = []
    }
    acc[file.directory].push(file)
    return acc
  }, {} as Record<string, DocFile[]>)

  // Sort within each directory by sidebar_position
  Object.keys(grouped).forEach(dir => {
    grouped[dir].sort((a, b) => a.sidebarPosition - b.sidebarPosition)
  })

  // Define directory order (you can customize this)
  const directoryOrder = [
    'root',
    'installation',
    'tutorials',
    'cli',
    'models',
    'controllers',
    'routing',
    'serializers',
    'openapi',
    'specs',
    'decorators',
    'plugins',
    'utils',
    'config',
    'deployment',
    'editors',
    'contributing',
    'learn-more',
  ]

  const sortedFiles: DocFile[] = []

  // Add files in directory order
  for (const dir of directoryOrder) {
    if (grouped[dir]) {
      sortedFiles.push(...grouped[dir])
      delete grouped[dir]
    }
  }

  // Add any remaining directories
  Object.keys(grouped).forEach(dir => {
    sortedFiles.push(...grouped[dir])
  })

  return sortedFiles
}

function generateCombinedMarkdown(files: DocFile[]): string {
  let combined = `# Psychic Guides - Complete Documentation

*Generated on ${new Date().toISOString()}*

This document contains all the Psychic framework documentation combined into a single file for AI consumption.

---

`

  for (const file of files) {
    const sectionTitle = file.directory === 'root' ? file.title : `${file.directory}/${file.title}`

    combined += `## ${sectionTitle}\n\n`
    combined += `*Source: ${file.path}*\n\n`

    // Add the content, but adjust heading levels to prevent conflicts
    const adjustedContent = file.content
      .replace(/^###### /gm, '####### ') // h6 -> h7 (not standard but keeps hierarchy)
      .replace(/^##### /gm, '###### ') // h5 -> h6
      .replace(/^#### /gm, '##### ') // h4 -> h5
      .replace(/^### /gm, '#### ') // h3 -> h4
      .replace(/^## /gm, '### ') // h2 -> h3
      .replace(/^# /gm, '## ') // h1 -> h2

    combined += adjustedContent
    combined += '\n\n---\n\n'
  }

  return combined
}

function main() {
  const docsDir = path.join(process.cwd(), 'docs')
  const outputFile = path.join(process.cwd(), 'combined-docs.md')

  console.log('📚 Collecting all documentation files...')
  const files = getAllDocFiles(docsDir)
  console.log(`Found ${files.length} documentation files`)

  console.log('🔄 Sorting files by structure...')
  const sortedFiles = sortFilesByStructure(files)

  console.log('📝 Generating combined markdown...')
  const combinedContent = generateCombinedMarkdown(sortedFiles)

  console.log('💾 Writing combined documentation...')
  fs.writeFileSync(outputFile, combinedContent, 'utf-8')

  console.log(`✅ Successfully created ${outputFile}`)
  console.log(`📊 Total size: ${Math.round(combinedContent.length / 1024)} KB`)
}

if (require.main === module) {
  main()
}
