import { fmtUptime } from '../../lib/utils.js'
export default {
  name: 'alive', category: 'general', desc: 'Check if the bot is online',
  async run(c) {
    await c.reply(`💚 *${c.config.botName}* is online!\n\n⏱ Uptime: ${fmtUptime(process.uptime())}\n📜 Type ${c.prefix}menu to see commands`)
  }
}
