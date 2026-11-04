export default {
  name: 'welcome', category: 'admin', desc: 'Turn welcome messages on/off',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (!['on', 'off'].includes(v)) return c.reply(`Usage: ${c.prefix}welcome on/off`)
    c.group.welcome = v === 'on'; c.db.save()
    await c.reply(`✅ Welcome message is now *${v.toUpperCase()}*`)
  }
}
