export default {
  name: 'lock',
  category: 'admin',
  desc: 'Lock group settings so only admins can edit info',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    await c.sock.groupSettingUpdate(c.from, 'locked')
    await c.reply('🔒 Group settings locked. Only admins can edit group info.')
  }
}
