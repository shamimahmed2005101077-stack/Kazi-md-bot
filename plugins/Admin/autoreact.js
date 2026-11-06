const EMOJIS = ['❤️', '😂', '🔥', '👍', '😍', '🥰', '😎', '🤩', '💯', '🙏', '😊', '🎉', '😘', '🤝', '💖']
const pick = a => a[Math.floor(Math.random() * a.length)]
const last = new Map()

export default {
  name: 'autoreact', category: 'admin', desc: 'Auto-react to group messages (on/off)',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (!['on', 'off'].includes(v)) return c.reply(`Usage: ${c.prefix}autoreact on/off`)
    c.group.autoreact = v === 'on'; c.db.save()
    await c.reply(`✅ Auto react is now *${v.toUpperCase()}* in this group.`)
  },

  // runs on normal messages; never blocks other auto plugins
  async auto(c) {
    if (!c.isGroup || !c.group?.autoreact || c.m.key.fromMe) return false
    const now = Date.now()
    if (now - (last.get(c.from) || 0) < 2000) return false   // max one reaction per 2 sec per group
    last.set(c.from, now)
    await c.sock.sendMessage(c.from, { react: { text: pick(EMOJIS), key: c.m.key } }).catch(() => {})
    return false
  }
}
