#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function ensureLock(rootPath) {
  const lockPath = path.join(rootPath, '.next', 'lock')
  try {
    fs.mkdirSync(path.dirname(lockPath), { recursive: true })
    if (!fs.existsSync(lockPath)) {
      fs.writeFileSync(lockPath, JSON.stringify({ createdAt: new Date().toISOString() }))
      console.log(`[ensure-next-lock] created ${lockPath}`)
    }
  } catch (error) {
    console.warn(`[ensure-next-lock] unable to prepare ${lockPath}: ${error.message}`)
  }
}

const roots = [process.cwd()]

if (process.env.VERCEL) {
  roots.push(path.resolve(process.cwd(), '..'))
}

for (const root of roots) {
  ensureLock(root)
}
