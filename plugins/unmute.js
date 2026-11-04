export default {
  name: 'unmute', category: 'admin', desc: 'Let everyone send messages',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    await c.sock.groupSettingUpdate(c.from, 'not_announcement')
    await c.reply('🔊 Group unmuted. Everyone can send messages.')
  }
}
