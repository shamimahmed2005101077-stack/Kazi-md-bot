import { config } from './config.js'
import { commands } from './loader.js'

const ORDER = ['owner', 'general', 'admin']

export function buildMenu() {
  const uniq = [...new Set(commands.values())]
  const cats = {}
  for (const c of uniq) (cats[c.category] ||= []).push(c.name)
  const keys = Object.keys(cats).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
  const p = config.prefixes[0]
  const time = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })

  let t = `◈╭─❍「 *${config.botName} MENU* 」❍\n`
  t += `◈├• 🌟 *Bot: ${config.botName}*\n`
  t += `◈├• ⚙️ *Prefix: ${config.prefixes.join(', ')}*\n`
  t += `◈├• 🍫 *Plugins: ${uniq.length}*\n`
  t += `◈├• 💎 *Version: ${config.version}*\n`
  t += `◈├• ⏰ *Time: ${time}*\n`
  for (const k of keys) {
    t += `◈├─❍「 *${k.toUpperCase()}* 」❍\n`
    for (const n of cats[k].sort()) t += `◈├• ${p}${n}\n`
  }
  t += `◈╰──★─☆──♪♪─❍\n`
  if (config.waChannelLink) t += `\n📢 WhatsApp Channel:\n${config.waChannelLink}\n`
  if (config.telegramChannel) t += `\n✈️ Telegram Channel:\n${config.telegramChannel}\n`
  return t
}
