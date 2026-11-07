const MODES = {
  kick: 'delete the message + remove the sender',
  del: 'only delete the message',
  warn: 'delete + warning (removed after 3 warnings)'
}

export default {
  name: 'antilink', category: 'admin', desc: 'Block WhatsApp group links (on/off, set kick/del/warn)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const a = c.args.map(x => x.toLowerCase())
    const mode = c.group.antilinkMode || 'kick'

    if (a[0] === 'set') {
      if (!MODES[a[1]]) return c.reply(`Usage:\n${c.prefix}antilink set kick\n${c.prefix}antilink set del\n${c.prefix}antilink set warn`)
      c.group.antilinkMode = a[1]; c.group.antilink = true; c.db.save()
      return c.reply(`✅ Anti-link is *ON*\nAction: *${a[1].toUpperCase()}* (${MODES[a[1]]})`)
    }
    if (a[0] === 'on' || a[0] === 'off') {
      c.group.antilink = a[0] === 'on'; c.db.save()
      return c.reply(`✅ Anti-link is now *${a[0].toUpperCase()}*` + (a[0] === 'on' ? `\nAction: *${mode.toUpperCase()}* (${MODES[mode]})` : ''))
    }
    await c.reply(`🔗 *Anti-link:* ${c.group.antilink ? 'ON' : 'OFF'}\nAction: *${mode.toUpperCase()}* (${MODES[mode]})\n\n` +
      `${c.prefix}antilink on / off\n${c.prefix}antilink set kick\n${c.prefix}antilink set del\n${c.prefix}antilink set warn`)
  }
}
