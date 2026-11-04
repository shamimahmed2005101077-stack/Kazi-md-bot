import fs from 'fs'
import pino from 'pino'
import { downloadMediaMessage, normalizeMessageContent } from '@whiskeysockets/baileys'

export default {
  name: 'setmenuimage', category: 'owner', desc: 'Set the menu picture (reply to a photo or give a link)',
  ownerOnly: true,
  async run(c) {
    // Option 1: image link  ->  .setmenuimage https://...
    if (/^https?:\/\//i.test(c.text)) {
      c.config.menuImage = c.text.trim()
    } else {
      // Option 2: photo sent with caption, or reply to a photo
      const content = normalizeMessageContent(c.m.message)
      let msg = null
      if (content?.imageMessage) {
        msg = c.m
      } else {
        const ci = content?.extendedTextMessage?.contextInfo
        const q = ci?.quotedMessage ? normalizeMessageContent(ci.quotedMessage) : null
        if (q?.imageMessage) msg = { key: { remoteJid: c.from, id: ci.stanzaId, participant: ci.participant }, message: q }
      }
      if (!msg) return c.reply(`Reply to a photo with *${c.prefix}setmenuimage*\nor send: ${c.prefix}setmenuimage https://image-link`)

      const buf = await downloadMediaMessage(msg, 'buffer', {}, {
        logger: pino({ level: 'silent' }), reuploadRequest: c.sock.updateMediaMessage
      })
      fs.mkdirSync('media', { recursive: true })
      fs.writeFileSync('media/menu.jpg', buf)
      c.config.menuImage = './media/menu.jpg'
    }
    fs.writeFileSync('config.json', JSON.stringify(c.config, null, 2))
    await c.reply(`✅ Menu image updated.\nType ${c.prefix}menu to see it.`)
  }
}
