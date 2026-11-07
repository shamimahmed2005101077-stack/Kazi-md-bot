import { sleep } from '../../lib/utils.js'
const num = j => j.split('@')[0].split(':')[0]
const idsOf = p => [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(num)

export default {
  name: 'demoteall', category: 'admin', desc: 'Remove admin rights from all other admins',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    // kept: the bot, the bot owner, you (who typed the command) and the group creator (cannot be demoted)
    const keep = new Set([c.botNum, String(c.config.ownerNumber).replace(/\D/g, ''), num(c.sender)])
    const list = c.meta.participants
      .filter(p => p.admin === 'admin' && !idsOf(p).some(n => keep.has(n)))
      .map(p => p.id)
    if (!list.length) return c.reply('No other admins to demote.')

    await c.reply(`⏳ Demoting ${list.length} admins...`)
    let done = 0
    for (let i = 0; i < list.length; i += 5) {
      const res = await c.sock.groupParticipantsUpdate(c.from, list.slice(i, i + 5), 'demote').catch(() => [])
      done += (res || []).filter(r => String(r.status) === '200').length
      await sleep(1500)
    }
    await c.reply(`✅ Done. Demoted ${done} of ${list.length} admins.`)
  }
}
