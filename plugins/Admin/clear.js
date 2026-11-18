export default {
  name: 'clear',
  aliases: ['resetwarn'],
  category: 'admin',
  desc: 'Clear warnings for a user or entire group',
  groupOnly: true, adminOnly: true,
  async run(c) {
    c.group.warns ||= {}
    if (c.targets[0]) {
      delete c.group.warns[c.targets[0]]
      c.db.save()
      return c.reply(`✅ Warnings cleared for @${c.targets[0].split('@')[0]}`, { mentions: [c.targets[0]] })
    }
    c.group.warns = {}
    c.db.save()
    await c.reply('✅ All group warnings have been cleared.')
  }
}
