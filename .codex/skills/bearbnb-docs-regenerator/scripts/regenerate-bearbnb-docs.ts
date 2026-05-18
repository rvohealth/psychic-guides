#!/usr/bin/env tsx

import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

const DOCS_DIR = join(process.cwd(), 'docs', 'tutorials', 'bearbnb')
const SKIP_COUNT = 2

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function git(repoPath: string, args: string[]): string {
  return execFileSync('git', ['-C', repoPath, ...args], { encoding: 'utf8' })
}

function toKebab(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function ensureRepo(repoPath: string) {
  if (!existsSync(repoPath)) throw new Error(`BearBnB root does not exist: ${repoPath}`)

  const isRepo = git(repoPath, ['rev-parse', '--is-inside-work-tree']).trim()
  if (isRepo !== 'true') throw new Error(`BearBnB root is not a git repo: ${repoPath}`)
}

function main() {
  const bearbnbRoot = argValue('--bearbnb-root')
  if (!bearbnbRoot) {
    throw new Error('Missing required --bearbnb-root <path>')
  }

  if (!existsSync(DOCS_DIR)) {
    throw new Error(`Run from psychic-guides root; missing ${DOCS_DIR}`)
  }

  ensureRepo(bearbnbRoot)

  const hashes = git(bearbnbRoot, ['log', '--reverse', '--format=%H'])
    .trim()
    .split('\n')
    .filter(Boolean)
    .slice(SKIP_COUNT)

  if (hashes.length === 0) throw new Error('No BearBnB commits found after skip count')

  mkdirSync(DOCS_DIR, { recursive: true })

  for (const filename of readdirSync(DOCS_DIR)) {
    if (/^\d{2}-.*\.mdx$/.test(filename)) {
      rmSync(join(DOCS_DIR, filename))
    }
  }

  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i]
    const message = git(bearbnbRoot, ['log', '-1', '--format=%B', hash]).trimEnd()
    const diff = git(bearbnbRoot, ['show', '--format=', hash]).trimStart().trimEnd()
    const firstLine = message.split('\n')[0]
    const num = String(i + 1).padStart(2, '0')
    const slug = `${num}-${toKebab(firstLine)}`
    const filename = `${slug}.mdx`

    const content = `---
title: ${firstLine}
id: bearbnb-${slug}
---

# ${firstLine}

## Commit Message

\`\`\`\`\`\`
${message}
\`\`\`\`\`\`

## Changes

\`\`\`\`\`\`
${diff}
\`\`\`\`\`\`
`

    writeFileSync(join(DOCS_DIR, filename), content)
    console.log(`wrote ${filename}`)
  }

  console.log(`\ndone - ${hashes.length} files in ${DOCS_DIR}`)
}

main()
