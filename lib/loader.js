import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export const commands = new Map()
export const autos = []   // plugins with an auto(ctx) function (no-prefix replies)

export async function loadPlugins() {
  const root = path.resolve('plugins')
  for (const dir of fs.readdirSync(root)) {
    const d = path.join(root, dir)
    if (!fs.statSync(d).isDirectory()) continue
    for (const f of fs.readdirSync(d).filter(f => f.endsWith('.js'))) {
      try {
        const mod = await import(pathToFileURL(path.join(d, f)).href)
        const cmd = mod.default
        if (!cmd?.name) continue
        cmd.category ||= dir
        commands.set(cmd.name, cmd)
        for (const a of cmd.aliases || []) commands.set(a, cmd)
        if (typeof cmd.auto === 'function') autos.push(cmd)
      } catch (e) {
        console.log(`❌ Failed to load ${dir}/${f}:`, e.message)
      }
    }
  }
}
