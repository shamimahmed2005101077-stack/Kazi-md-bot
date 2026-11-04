export default {
  name: 'tagall', category: 'admin', desc: 'Mention every member',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const members = c.meta.participants.map(p => p.id)
    const text = `📢 *${c.text || 'Attention everyone!'}*\n\n` + members.map(j => '• @' + j.split('@')[0]).join('\n')
    await c.reply(text, { mentions: members })
  }
}
