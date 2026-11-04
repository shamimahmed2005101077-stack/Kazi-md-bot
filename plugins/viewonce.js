import pino from 'pino'
import { downloadMediaMessage, normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

export default {
  name: 'viewonce', aliases: ['vv', 'readviewonce'], category: 'general',
  desc: 'Reply to a view-once photo/video/voice to open it normally',
  async run(c) {
    const content = normalizeMessageContent(c.m.message)
    const ci = content?.extendedTextMessage?.contextInfo
    const q = ci?.quotedMessage ? normalizeMessageContent(ci.quotedMessage) : null
    const type = q && getContentType(q)
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(type))
      return c.reply(`Reply to a view-once photo, video or voice message with *${c.prefix}viewonce*`)

    const msg = { key: { remoteJid: c.from, id: ci.stanzaId, participant: ci.participant }, message: q }
    const buf = await downloadMediaMessage(msg, 'buffer', {}, {
      logger: pino({ level: 'silent' }), reuploadRequest: c.sock.updateMediaMessage
    })
    const caption = q[type].caption || ''
    let out
    if (type === 'imageMessage') out = { image: buf, caption }
    else if (type === 'videoMessage') out = { video: buf, caption }
    else out = { audio: buf, mimetype: 'audio/mp4', ptt: !!q.audioMessage.ptt }
    await c.sock.sendMessage(c.from, out, { quoted: c.quote })
  }
}
