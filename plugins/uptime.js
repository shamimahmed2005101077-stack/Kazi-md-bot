import { fmtUptime } from '../../lib/utils.js'
export default {
  name: 'uptime', category: 'general', desc: 'Show how long the bot has been running',
  async run(c) { await c.reply(`⏱ Uptime: ${fmtUptime(process.uptime())}`) }
}
