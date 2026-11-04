export default {
  name: 'promote', category: 'admin', desc: 'Make a member admin (reply or @mention)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    if (!c.targets.length) return c.reply('Reply to a member or @mention someone.')
    await c.sock.groupParticipantsUpdate(c.from, c.targets, 'promote')
  }
}
