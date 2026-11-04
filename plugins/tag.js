export default {
  name: 'tag', category: 'admin', desc: 'Reply to a message to re-send it tagging everyone',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const members = c.meta.participants.map(p => p.id)
    const text = c.quotedText || c.text
    if (!text) return c.reply(`Reply to a text message with ${c.prefix}tag`)
    await c.sock.sendMessage(c.from, { text, mentions: members }, { quoted: c.quote })
  }
}
