export default {
  name: 'hidetag', category: 'admin', desc: 'Send a message that silently mentions everyone',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const members = c.meta.participants.map(p => p.id)
    await c.sock.sendMessage(c.from, { text: c.text || '📢', mentions: members }, { quoted: c.quote })
  }
}
