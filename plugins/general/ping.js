export default {
  name: 'ping','p', category: 'general', desc: 'Check bot speed',
  async run(c) {
    const ms = Math.max(Date.now() - Number(c.m.messageTimestamp) * 1000, 0)
    await c.reply(`🏓 Pong! ${ms} ms`)
  }
}
