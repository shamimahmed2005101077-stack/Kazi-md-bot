export default {
  name: 'mode', aliases: ['setmode'], category: 'owner', desc: 'Switch the bot between public and private',
  selfOnly: true,   // only the number this bot is connected to
  async run(c) {
    const s = c.db.bot(c.botNum)
    const map = { public: 'public', private: 'private', self: 'private' }
    const v = map[c.args[0]?.toLowerCase()]
    if (!v) {
      return c.reply(`🔧 *Current mode:* ${s.mode.toUpperCase()}\n\n` +
        `${c.prefix}mode public  → everyone can use the bot\n` +
        `${c.prefix}mode private → only you (the bot owner) can use it`)
    }
    s.mode = v
    c.db.save()
    await c.reply(v === 'public'
      ? '🌍 Mode: *PUBLIC*\nEveryone can use the bot.'
      : '🔒 Mode: *PRIVATE*\nOnly the bot owner can use the bot now.')
  }
}
