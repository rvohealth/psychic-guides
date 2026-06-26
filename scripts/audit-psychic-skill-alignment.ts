#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()
const docsRoot = path.join(repoRoot, 'docs')
const skillRoot =
  process.env.PSYCHIC_SKILL_DIR || path.join(process.env.HOME || '', '.agents/skills/psychic-skill')

const topicMap: Record<string, string[]> = {
  'generators.md': ['docs/models/generating.mdx', 'docs/cli/generators', 'docs/controllers/generating.mdx'],
  'models.md': ['docs/models'],
  'querying.md': ['docs/models/querying'],
  'controllers.md': ['docs/controllers', 'docs/openapi/controllers.mdx'],
  'serializers.md': ['docs/serializers', 'docs/openapi/serializers.mdx'],
  'migrations.md': ['docs/migrations', 'docs/cli/generators/migration.mdx'],
  'soft-delete.md': ['docs/models/destroying.mdx', 'docs/models/querying/removeDefaultScope.mdx'],
  'sti.md': ['docs/models/sti.mdx', 'docs/cli/generators/sti-child.mdx'],
  'i18n.md': ['docs/utils/i18n', 'docs/models/querying/passthrough.mdx'],
  'workers.md': ['docs/plugins/workers'],
  'websockets.md': ['docs/plugins/websockets'],
  'testing.md': ['docs/specs', 'docs/plugins/workers/testing.mdx'],
  'utils.md': ['docs/utils'],
  'console.md': ['docs/cli/repl.mdx', 'docs/config/repl.mdx'],
  'deploying.md': ['docs/deployment/server'],
}

const stalePatterns: Array<[RegExp, string]> = [
  [/requestBody:\s*\{\s*only:/, 'Use requestBody.params instead of requestBody.only'],
  [/process\.env\.[A-Z0-9_]+/, 'Use AppEnv instead of direct process.env in application examples'],
  [/new Date\(/, 'Use Dream date/time classes except explicit JS interop examples'],
  [/deleted_at:datetime(?!:optional)/, 'Soft-delete migration shorthand should be nullable'],
  [/from '@rvoh\/dream'[\s\S]{0,80}\b(camelize|compact|groupBy|uniq|range)\b/, 'Utility helpers should import from @rvoh/dream/utils'],
]

function existsRelative(relativePath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relativePath))
}

function allDocFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...allDocFiles(full))
    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) out.push(full)
  }
  return out
}

const failures: string[] = []

for (const [skillFile, docsTargets] of Object.entries(topicMap)) {
  const skillPath = path.join(skillRoot, skillFile)
  if (!fs.existsSync(skillPath)) {
    failures.push(`Missing skill file: ${skillPath}`)
    continue
  }

  const missingTargets = docsTargets.filter(target => !existsRelative(target))
  if (missingTargets.length) {
    failures.push(`${skillFile}: missing docs target(s): ${missingTargets.join(', ')}`)
  }
}

for (const file of allDocFiles(docsRoot)) {
  const rel = path.relative(repoRoot, file)
  const text = fs.readFileSync(file, 'utf8')

  if (/docs\/tutorials\/bearbnb\/[0-9][0-9]-/.test(rel)) continue

  for (const [pattern, message] of stalePatterns) {
    if (message.includes('date/time') && (rel.startsWith('docs/utils/date-time/') || rel === 'docs/intro.mdx')) {
      continue
    }
    if (pattern.test(text)) {
      failures.push(`${rel}: ${message}`)
    }
  }
}

if (failures.length) {
  console.error('psychic-skill alignment audit found issues:\n')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('psychic-skill alignment audit passed')
