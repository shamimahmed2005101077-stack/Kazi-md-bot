export default {
  name: 'warn',
  category: 'admin',
  desc: 'Warn a group member (auto-kick on 3 warnings)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const target = c.targets[0]
    if (!target) return c.reply(`Tag or reply to a user: ${c.prefix}warn @user [reason]`)
    if (c.isAdminJid(target)) return c.reply('❌ Cannot warn a group admin.')
    const w = (c.group.warns ||= {})
    const count = w[target] = (w[target] || 0) + 1
    const reason = c.text.replace(/@\d+/g, '').trim() || 'Rule violation'
    if (count >= 3) {
      delete w[target]; c.db.save()
      await c.sock.groupParticipantsUpdate(c.from, [target], 'remove')
      return c.reply(`🚫 @${target.split('@')[0]} reached 3/3 warnings and was removed.\nReason: ${reason}`, { mentions: [target] })
    }
    c.db.save()
    await c.reply(`⚠️ *Warning ${count}/3* for @${target.split('@')[0]}\nReason: ${reason}`, { mentions: [target] })
  }
}
