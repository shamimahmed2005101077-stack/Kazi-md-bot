const lastMsg = new Map()

export default {
  name: 'slowmode',
  category: 'admin',
  desc: 'Set message cooldown (seconds) for non-admins in group',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (v === 'off' || v === '0') {
      c.group.slowmode = 0; c.db.save()
      return c.reply('⚡ Slowmode turned *OFF*.')
    }
    const sec = Number(v)
    if (!Number.isInteger(sec) || sec < 2 || sec > 3600)
      return c.reply(`Usage: ${c.prefix}slowmode <seconds (2-3600) | off>`)
    c.group.slowmode = sec; c.db.save()
    await c.reply(`🐢 Slowmode enabled: *1 message every ${sec}s* for non-admins.`)
  },
  async auto(c) {
    if (!c.isGroup || !c.group?.slowmode || c.isAdmin || c.isOwner || !c.isBotAdmin) return false
    const key = `${c.from}|${c.sender}`
    const now = Date.now(), wait = c.group.slowmode * 1000
    if (lastMsg.has(key) && now - lastMsg.get(key) < wait) {
      await c.sock.sendMessage(c.from, { delete: c.m.key }).catch(() => {})
      return true
    }
    lastMsg.set(key, now)
    return false
  }
}
