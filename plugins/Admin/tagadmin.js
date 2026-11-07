const num = j => j.split('@')[0].split(':')[0]
const last = new Map()

export default {
  name: 'tagadmin', aliases: ['tagadmins', 'admins'], category: 'admin',
  desc: 'Mention all group admins (everyone can use it)',
  groupOnly: true,
  async run(c) {
    const now = Date.now()
    if (!c.isAdmin && !c.isOwner && now - (last.get(c.from) || 0) < 30000)
      return c.reply('⏳ Please wait a little before calling the admins again.')
    last.set(c.from, now)

    const admins = c.meta.participants.filter(p => p.admin).map(p => p.id)
    if (!admins.length) return c.reply('No admins found in this group.')
    let t = '🛡️ *CALLING ADMINS*\n\n'
    if (c.text) t += `💬 ${c.text}\n\n`
    t += admins.map(j => '• @' + num(j)).join('\n')
    await c.reply(t, { mentions: admins })
  }
}
