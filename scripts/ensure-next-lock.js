#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function ensureLock(rootPath) {
  const lockPath = path.join(rootPath, '.next', 'lock')
  try {
    fs.mkdirSync(path.dirname(lockPath), { recursive: true })
    if (!fs.existsSync(lockPath)) {
      fs.writeFileSync(lockPath, JSON.stringify({ createdAt: new Date().toISOString(), root: rootPath }))
      console.log(`[ensure-next-lock] created ${lockPath}`)
    } else {
      console.log(`[ensure-next-lock] already exists ${lockPath}`)
    }
  } catch (error) {
    console.warn(`[ensure-next-lock] unable to prepare ${lockPath}: ${error.code ?? ''} ${error.message}`)
  }
}

const roots = new Set()
const cwd = process.cwd()
roots.add(cwd)
roots.add(path.resolve(cwd, '..'))
roots.add(path.resolve(cwd, '..', '..'))

if (process.env.VERCEL) {
  roots.add('/vercel/path0')
  roots.add('/vercel/path1')
}

const customRoots = (process.env.NEXT_LOCK_PATHS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
customRoots.forEach((r) => roots.add(r))

for (const root of roots) {
  ensureLock(root)
}
