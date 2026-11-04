import fs from 'fs'
import { loadPlugins, commands } from './lib/loader.js'
import { startSession } from './lib/connect.js'
import { startTelegram } from './lib/telegram.js'

await loadPlugins()
console.log(`📦 Loaded ${new Set(commands.values()).size} commands`)

fs.mkdirSync('sessions', { recursive: true })
for (const n of fs.readdirSync('sessions')) startSession(n).catch(console.error)

startTelegram()
