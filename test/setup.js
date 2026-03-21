/**
 * Load vanilla JS source files into the jsdom global scope.
 * Uses indirect eval: (0, eval)(code) — this evaluates in global (non-strict)
 * context, so top-level function declarations bind to globalThis (window).
 * Works because source files have no 'use strict' and no ES module syntax.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Mock localStorage before loading storage.js
const store = {}
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v) },
  removeItem: (k) => { delete store[k] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  hasOwnProperty: (k) => Object.prototype.hasOwnProperty.call(store, k),
  get length() { return Object.keys(store).length },
  key: (i) => Object.keys(store)[i] ?? null,
  [Symbol.iterator]: function* () { yield* Object.keys(store) },
}

// Ensure crypto.randomUUID exists (jsdom provides crypto but may lack randomUUID)
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => Math.random().toString(36).slice(2) + Date.now() },
    writable: true,
  })
}

const files = [
  'js/storage.js',
  'js/decks.js',
  'js/cards.js',
  'js/learning.js',
]

for (const file of files) {
  const code = readFileSync(resolve(root, file), 'utf-8')
  ;(0, eval)(code) // indirect eval — binds to global scope
}
