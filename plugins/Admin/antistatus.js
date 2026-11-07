const MODES = {
  kick: 'delete the message + remove the sender',
  del: 'only delete the message',
  warn: 'delete + warning (removed after 3 warnings)'
}

export default {
  name: 'antistatus', aliases: ['antimention', 'antistatusmention'], category: 'admin',
  desc: 'Block "this group was mentioned" status posts (on/off, set kick/del/warn)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const a = c.args.map(x => x.toLowerCase())
    const mode = c.group.antistatusMode || 'del'

    if (a[0] === 'set') {
      if (!MODES[a[1]]) return c.reply(`Usage:\n${c.prefix}antistatus set kick\n${c.prefix}antistatus set del\n${c.prefix}antistatus set warn`)
      c.group.antistatusMode = a[1]; c.group.antistatus = true; c.db.save()
      return c.reply(`✅ Anti status-mention is *ON*\nAction: *${a[1].toUpperCase()}* (${MODES[a[1]]})`)
    }
    if (a[0] === 'on' || a[0] === 'off') {
      c.group.antistatus = a[0] === 'on'; c.db.save()
      return c.reply(`✅ Anti status-mention is now *${a[0].toUpperCase()}*` + (a[0] === 'on' ? `\nAction: *${mode.toUpperCase()}* (${MODES[mode]})` : ''))
    }
    await c.reply(`📛 *Anti status-mention:* ${c.group.antistatus ? 'ON' : 'OFF'}\nAction: *${mode.toUpperCase()}* (${MODES[mode]})\n\n` +
      `${c.prefix}antistatus on / off\n${c.prefix}antistatus set kick\n${c.prefix}antistatus set del\n${c.prefix}antistatus set warn`)
  }
}
