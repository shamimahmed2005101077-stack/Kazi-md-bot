export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  desc: 'Broadcast a message to all participating groups',
  ownerOnly: true,
  async run(c) {
    const msg = c.text || c.quotedText
    if (!msg) return c.reply(`Usage: ${c.prefix}broadcast <message>`)
    const groups = Object.keys(await c.sock.groupFetchAllParticipating())
    let ok = 0
    for (const gid of groups) {
      try {
        await c.sock.sendMessage(gid, { text: `📢 *Broadcast:*\n\n${msg}`, contextInfo: c.channelCtx })
        ok++
      } catch {}
    }
    await c.reply(`✅ Broadcast sent to ${ok}/${groups.length} groups.`)
  }
}
