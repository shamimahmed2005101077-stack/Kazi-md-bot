export default {
  name: 'unlock',
  category: 'admin',
  desc: 'Unlock group settings so all members can edit info',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    await c.sock.groupSettingUpdate(c.from, 'unlocked')
    await c.reply('🔓 Group settings unlocked. Members can edit group info.')
  }
}
