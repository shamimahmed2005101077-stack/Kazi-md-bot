import { sleep } from '../../lib/utils.js'
const num = j => j.split('@')[0].split(':')[0]
const idsOf = p => [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(num)

export default {
  name: 'kickall', category: 'admin', desc: 'Remove ALL non-admin members at once',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const keep = new Set([c.botNum, String(c.config.ownerNumber).replace(/\D/g, ''), num(c.sender)])
    const list = c.meta.participants
      .filter(p => !p.admin && !idsOf(p).some(n => keep.has(n)))
      .map(p => p.id)
    if (!list.length) return c.reply('No non-admin members to remove.')

    await c.reply(`⏳ Removing ${list.length} members...`)
    let done = 0
    for (let i = 0; i < list.length; i += 5) {
      const res = await c.sock.groupParticipantsUpdate(c.from, list.slice(i, i + 5), 'remove').catch(() => [])
      done += (res || []).filter(r => String(r.status) === '200').length
      await sleep(1500)
    }
    await c.reply(`✅ Done. Removed ${done} of ${list.length} members.`)
  }
}
