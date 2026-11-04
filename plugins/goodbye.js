export default {
  name: 'goodbye', category: 'admin', desc: 'Turn goodbye messages on/off',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (!['on', 'off'].includes(v)) return c.reply(`Usage: ${c.prefix}goodbye on/off`)
    c.group.goodbye = v === 'on'; c.db.save()
    await c.reply(`✅ Goodbye message is now *${v.toUpperCase()}*`)
  }
}
