export default {
  name: 'kick', aliases: ['remove'], category: 'admin', desc: 'Remove a member (reply or @mention)',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const list = c.targets.filter(j => !c.isAdminJid(j))
    if (!list.length) return c.reply('Reply to a member or @mention someone to kick.\n(Admins cannot be kicked.)')
    await c.sock.groupParticipantsUpdate(c.from, list, 'remove')
    await c.reply(`✅ Removed ${list.length} member(s).`)
  }
}
