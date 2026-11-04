export default {
  name: 'antilink', category: 'admin', desc: 'Delete WhatsApp group links and remove the sender',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (!['on', 'off'].includes(v)) return c.reply(`Usage: ${c.prefix}antilink on/off`)
    c.group.antilink = v === 'on'; c.db.save()
    await c.reply(`✅ Anti-link is now *${v.toUpperCase()}*`)
  }
}
