import { commands } from '../../lib/loader.js'
import { fmtUptime } from '../../lib/utils.js'

export default {
  name: 'info', aliases: ['botinfo'], category: 'general', desc: 'Show information about the bot',
  async run(c) {
    const mode = c.db.bot(c.botNum).mode
    const time = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' })
    const ram = Math.round(process.memoryUsage().rss / 1024 / 1024)
    await c.reply(
`◈╭─❍「 *${c.config.botName} INFO* 」❍
◈├• 🤖 *Bot:* ${c.config.botName}
◈├• 💎 *Version:* ${c.config.version}
◈├• 📱 *Number:* +${c.botNum}
◈├• 👑 *Owner:* ${c.config.ownerName || 'Shamim Ahmed'}
◈├• ⚙️ *Prefix:* ${c.config.prefixes.join('  ')}
◈├• 🍫 *Commands:* ${new Set(commands.values()).size}
◈├• 🔧 *Mode:* ${mode.toUpperCase()}
◈├• ⏱ *Uptime:* ${fmtUptime(process.uptime())}
◈├• 🧠 *RAM used:* ${ram} MB
◈├• 🟢 *Node:* ${process.version}
◈├• 🕒 *Time:* ${time}
◈╰──★─☆──♪♪─❍

📜 Type ${c.prefix}menu to see all commands`)
  }
}
