import { sleep } from '../../lib/utils.js'
export default {
  name: 'kickall', category: 'admin', desc: 'Remove ALL non-admin members',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    if (c.args[0] !== 'confirm')
      return c.reply(`⚠️ This will remove ALL non-admin members.\nType *${c.prefix}kickall confirm* to continue.`)
    const list = c.meta.participants.filter(p => !p.admin).map(p => p.id)
    if (!list.length) return c.reply('No non-admin members to remove.')
    await c.reply(`⏳ Removing ${list.length} members...`)
    for (let i = 0; i < list.length; i += 5) {
      await c.sock.groupParticipantsUpdate(c.from, list.slice(i, i + 5), 'remove').catch(() => {})
      await sleep(1500)
    }
    await c.reply('✅ Done.')
  }
}
