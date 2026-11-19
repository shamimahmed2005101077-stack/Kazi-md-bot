import pino from 'pino'
import { downloadMediaMessage, normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

async function sendTag(c, customText = '') {
  const meta = c.meta || await c.sock.groupMetadata(c.from).catch(() => null)
  const members = (meta?.participants || [])
    .map(p => p.id || p.jid || p.phoneNumber)
    .filter(Boolean)
  if (!members.length) return c.reply('❌ Group members not found.')

  const content = normalizeMessageContent(c.m.message)
  const selfType = getContentType(content)
  const ci = content?.[selfType]?.contextInfo
  const q = ci?.quotedMessage ? normalizeMessageContent(ci.quotedMessage) : null
  const qType = q && getContentType(q)
  const contextInfo = { ...(c.channelCtx || {}), mentionedJid: members }

  if (q && ['imageMessage', 'videoMessage', 'stickerMessage'].includes(qType)) {
    const msgObj = { key: { remoteJid: c.from, id: ci.stanzaId, participant: ci.participant }, message: q }
    const buf = await downloadMediaMessage(msgObj, 'buffer', {}, {
      logger: pino({ level: 'silent' }),
      reuploadRequest: c.sock.updateMediaMessage
    })
    const caption = customText || q[qType]?.caption || ''
    if (qType === 'imageMessage') {
      return c.sock.sendMessage(c.from, { image: buf, caption, mentions: members, contextInfo }, { quoted: c.quote })
    }
    if (qType === 'videoMessage') {
      return c.sock.sendMessage(c.from, { video: buf, caption, mentions: members, contextInfo }, { quoted: c.quote })
    }
    await c.sock.sendMessage(c.from, { sticker: buf, mentions: members, contextInfo }, { quoted: c.quote })
    if (customText) {
      return c.sock.sendMessage(c.from, { text: customText, mentions: members, contextInfo })
    }
    return
  }

  const text = customText || c.quotedText || '📢 Attention everyone!'
  await c.sock.sendMessage(c.from, { text, mentions: members, contextInfo }, { quoted: c.quote })
}

export default {
  name: 'tag',
  aliases: ['everyone', 'all'],
  category: 'admin',
  desc: 'Tag all group members with your message or replied media',
  groupOnly: true,
  adminOnly: true,

  async run(c) {
    await sendTag(c, c.text)
  },

  async auto(c) {
    if (!c.isGroup || !(c.isAdmin || c.isOwner) || !c.body) return false
    const match = c.body.trim().match(/^@all(?:\s+([\s\S]+))?$/i)
    if (!match) return false
    await sendTag(c, (match[1] || '').trim())
    return true
  }
}
