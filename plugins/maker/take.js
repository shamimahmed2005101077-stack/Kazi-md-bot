import pino from 'pino'
import { downloadMediaMessage, normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

function injectStickerExif(webp, pack, author) {
  const json = Buffer.from(JSON.stringify({ 'sticker-pack-id': 'kazi.md.bot', 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: ['⚡'] }))
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  exifAttr.writeUInt32LE(json.length, 14)
  const payload = Buffer.concat([exifAttr, json])
  const pad = payload.length % 2 === 1 ? Buffer.from([0]) : Buffer.alloc(0)
  const hdr = Buffer.alloc(8); hdr.write('EXIF', 0); hdr.writeUInt32LE(payload.length, 4)
  const out = Buffer.concat([webp, hdr, payload, pad])
  out.writeUInt32LE(out.length - 8, 4)
  return out
}

export default {
  name: 'take',
  aliases: ['wm'],
  category: 'maker',
  desc: 'Change sticker pack name and author',
  async run(c) {
    const content = normalizeMessageContent(c.m.message)
    const ci = content?.extendedTextMessage?.contextInfo
    const q = ci?.quotedMessage ? normalizeMessageContent(ci.quotedMessage) : null
    if (!q || getContentType(q) !== 'stickerMessage') return c.reply(`Reply to a sticker with: ${c.prefix}take Pack|Author`)
    const [pack = c.config.botName || 'Kazi-md-bot-4X', author = c.config.ownerName || 'Kazi'] = c.text.split('|').map(s => s.trim())
    const buf = await downloadMediaMessage({ key: { remoteJid: c.from, id: ci.stanzaId, participant: ci.participant }, message: q }, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: c.sock.updateMediaMessage })
    await c.sock.sendMessage(c.from, { sticker: injectStickerExif(buf, pack, author), contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
