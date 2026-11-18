export default {
  name: 'shutdown',
  category: 'owner',
  desc: 'Stop the bot process cleanly',
  ownerOnly: true,
  async run(c) {
    await c.reply('🛑 Shutting down Kazi-md-bot-4X...')
    c.db.save()
    try { c.sock.end() } catch {}
    setTimeout(() => process.exit(0), 1000)
  }
}
