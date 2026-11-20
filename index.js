import fs from 'fs'
import path from 'path'
import { loadPlugins, commands } from './lib/loader.js'
import { startSession } from './lib/connect.js'
import { startTelegram } from './lib/telegram.js'

await loadPlugins()
console.log(`📦 Loaded ${new Set(commands.values()).size} commands`)

fs.mkdirSync('sessions', { recursive: true })
startTelegram()

const saved = fs.readdirSync('sessions').filter(n =>
  fs.statSync(path.join('sessions', n)).isDirectory()
)

for (const n of saved) {
  await startSession(n).catch(console.error)
  await new Promise(r => setTimeout(r, 1500))
}
