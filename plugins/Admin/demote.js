export default {
  name: 'demote', category: 'admin', desc: 'Remove admin rights (reply or @mention)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    if (!c.targets.length) return c.reply('Reply to an admin or @mention someone.')
    await c.sock.groupParticipantsUpdate(c.from, c.targets, 'demote')
  }
}
