#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const postsDir = path.join(process.cwd(), 'content', 'posts')

function findMdFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f))
}

function checkFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(raw)
  const errors = []

  if (data && Object.prototype.hasOwnProperty.call(data, 'date')) {
    const val = data.date
    // gray-matter will parse unquoted dates as Date objects
    if (val instanceof Date) {
      errors.push('frontmatter `date` parsed as Date object — please quote the date (e.g. "2026-01-22") or use ISO string')
    } else if (typeof val === 'string') {
      // Accept YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        errors.push('frontmatter `date` should be YYYY-MM-DD (ISO) — found: ' + val)
      }
    } else {
      errors.push('frontmatter `date` has unexpected type: ' + typeof val)
    }
  } else {
    errors.push('missing `date` in frontmatter')
  }

  return errors
}

function main() {
  if (!fs.existsSync(postsDir)) {
    console.error('No posts directory found:', postsDir)
    process.exit(1)
  }

  const files = findMdFiles(postsDir)
  let failed = false

  files.forEach((file) => {
    const rel = path.relative(process.cwd(), file)
    const errs = checkFile(file)
    if (errs.length) {
      failed = true
      console.error(`\n[frontmatter] ${rel}`)
      errs.forEach(e => console.error('  -', e))
    }
  })

  if (failed) {
    console.error('\nFrontmatter checks failed. Fix the errors above.')
    process.exit(1)
  }

  console.log('Frontmatter checks passed')
}

main()
