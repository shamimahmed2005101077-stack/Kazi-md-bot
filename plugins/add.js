export default {
  name: 'add', category: 'admin', desc: 'Add a member by number',
  usage: '.add 8801XXXXXXXXX', groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const nums = c.args.map(a => a.replace(/\D/g, '')).filter(n => n.length >= 10)
    if (!nums.length) return c.reply(`Usage: ${c.prefix}add 8801XXXXXXXXX (country code, no +)`)
    const res = await c.sock.groupParticipantsUpdate(c.from, nums.map(n => n + '@s.whatsapp.net'), 'add')
    const lines = res.map(r => `• ${String(r.jid || '').split('@')[0]}: ${r.status === '200' ? '✅ added' : r.status === '403' ? '📩 privacy on, invite needed' : '❌ failed (' + r.status + ')'}`)
    await c.reply(lines.join('\n'))
  }
}
