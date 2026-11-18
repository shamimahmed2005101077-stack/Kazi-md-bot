export default {
  name: 'block',
  category: 'owner',
  desc: 'Block a user on WhatsApp',
  ownerOnly: true,
  async run(c) {
    const target = c.targets[0] || (c.args[0] ? `${c.args[0].replace(/\D/g, '')}@s.whatsapp.net` : (!c.isGroup ? c.from : null))
    if (!target) return c.reply(`Mention/reply or enter number: ${c.prefix}block 88017...`)
    await c.sock.updateBlockStatus(target, 'block')
    await c.reply(`🚫 Blocked @${target.split('@')[0]}`, { mentions: [target] })
  }
}
