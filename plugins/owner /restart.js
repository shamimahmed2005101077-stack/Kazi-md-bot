export default {
  name: 'restart',
  category: 'owner',
  desc: 'Restart the bot process',
  ownerOnly: true,
  async run(c) {
    await c.reply('🔄 Restarting bot...')
    c.db.save()
    setTimeout(() => process.exit(0), 1000)
  }
}
