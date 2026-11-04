import { normalizeMessageContent, jidNormalizedUser } from '@whiskeysockets/baileys'

export default {
  name: 'delete', aliases: ['del'], category: 'admin', desc: 'Reply to a message to delete it',
  groupOnly: true, adminOnly: true, botAdmin: true,
  async run(c) {
    const content = normalizeMessageContent(c.m.message)
    const ci = content?.extendedTextMessage?.contextInfo
    if (!ci?.stanzaId) return c.reply(`Reply to the message you want to delete with *${c.prefix}delete*`)
    const fromMe = !!ci.participant && jidNormalizedUser(ci.participant) === c.botJid
    await c.sock.sendMessage(c.from, {
      delete: { remoteJid: c.from, fromMe, id: ci.stanzaId, participant: ci.participant }
    })
    await c.sock.sendMessage(c.from, { delete: c.m.key }).catch(() => {})  // also remove the command message
  }
}
