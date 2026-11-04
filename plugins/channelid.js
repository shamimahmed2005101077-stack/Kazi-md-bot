export default {
  name: 'channelid', category: 'general', desc: 'Get a WhatsApp channel JID from its link',
  usage: '.channelid https://whatsapp.com/channel/XXXX',
  async run(c) {
    const m = c.text.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/)
    if (!m) return c.reply(`Usage: ${c.prefix}channelid https://whatsapp.com/channel/XXXX`)
    const info = await c.sock.newsletterMetadata('invite', m[1])
    await c.reply(`📢 *${info.name}*\n\n🆔 ${info.id}`)
  }
}
