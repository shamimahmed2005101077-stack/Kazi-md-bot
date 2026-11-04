export default {
  name: 'mute', category: 'admin', desc: 'Only admins can send messages',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    await c.sock.groupSettingUpdate(c.from, 'announcement')
    await c.reply('🔇 Group muted. Only admins can send messages.')
  }
}
