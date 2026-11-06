import { configProblem } from '../../lib/nsfw.js'

export default {
  name: 'antinsfw', aliases: ['antiporn', 'nsfwfilter'], category: 'admin',
  desc: 'Delete explicit photos/stickers/videos and remove the sender (on/off)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (!['on', 'off'].includes(v))
      return c.reply(`🔞 Explicit-content filter is *${c.group.antinsfw ? 'ON' : 'OFF'}* in this group.\n\nUsage: ${c.prefix}antinsfw on/off`)
    if (v === 'on') {
      const problem = configProblem()
      if (problem) return c.reply(`⚠️ The filter cannot start yet.\n\n${problem}\n\nAfter fixing it, restart the bot and try again.`)
    }
    c.group.antinsfw = v === 'on'; c.db.save()
    await c.reply(v === 'on'
      ? '✅ Explicit-content filter is *ON*.\nExplicit photos, stickers and videos from members will be deleted and the sender removed.\n(Admins are not checked.)'
      : '✅ Explicit-content filter is *OFF*.')
  }
}
