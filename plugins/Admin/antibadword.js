const DEFAULT_BAD = ['fuck', 'bitch', 'asshole', 'bastard', 'slut']

export default {
  name: 'antibadword',
  category: 'admin',
  desc: 'Auto-delete messages with bad words (on/off/add/del/list)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const sub = c.args[0]?.toLowerCase()
    const word = c.args.slice(1).join(' ').toLowerCase()
    c.group.badwords ||= [...DEFAULT_BAD]
    if (sub === 'on' || sub === 'off') {
      c.group.antibadword = sub === 'on'; c.db.save()
      return c.reply(`🛡️ Anti-badword is now *${sub.toUpperCase()}*`)
    }
    if (sub === 'add' && word) {
      if (!c.group.badwords.includes(word)) c.group.badwords.push(word)
      c.db.save()
      return c.reply(`✅ Added "${word}" to blocked words.`)
    }
    if (sub === 'del' && word) {
      c.group.badwords = c.group.badwords.filter(w => w !== word)
      c.db.save()
      return c.reply(`🗑️ Removed "${word}" from blocked words.`)
    }
    if (sub === 'list') return c.reply(`📜 *Blocked words:*\n${c.group.badwords.join(', ')}`)
    await c.reply(`Usage: ${c.prefix}antibadword on|off|add <word>|del <word>|list`)
  },
  async auto(c) {
    if (!c.isGroup || !c.group?.antibadword || c.isAdmin || c.isOwner || !c.body) return false
    const words = c.group.badwords?.length ? c.group.badwords : DEFAULT_BAD
    const low = c.body.toLowerCase()
    if (!words.some(w => low.includes(w))) return false
    if (c.isBotAdmin) await c.sock.sendMessage(c.from, { delete: c.m.key }).catch(() => {})
    await c.reply(`⚠️ @${c.sender.split('@')[0]}, bad language is not allowed here.`, { mentions: [c.sender] })
    return true
  }
}
