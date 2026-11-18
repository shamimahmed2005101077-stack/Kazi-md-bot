import fs from 'fs'
import os from 'os'
import path from 'path'
import pino from 'pino'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { downloadMediaMessage, normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

const exec = promisify(execFile)

export default {
  name: 'sticker',
  aliases: ['s'],
  category: 'maker',
  desc: 'Convert image or short video to WhatsApp sticker',
  async run(c) {
    const content = normalizeMessageContent(c.m.message)
    const selfType = getContentType(content)
    const ci = content?.[selfType]?.contextInfo
    const q = ci?.quotedMessage ? normalizeMessageContent(ci.quotedMessage) : null
    const targetMsg = q || content
    const type = getContentType(targetMsg)
    if (!['imageMessage', 'videoMessage'].includes(type))
      return c.reply(`Reply to or send an image/video with *${c.prefix}sticker*`)
    const msgObj = q ? { key: { remoteJid: c.from, id: ci.stanzaId, participant: ci.participant }, message: q } : c.m
    const buf = await downloadMediaMessage(msgObj, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: c.sock.updateMediaMessage })
    const inFile = path.join(os.tmpdir(), `st_in_${Date.now()}`)
    const outFile = path.join(os.tmpdir(), `st_out_${Date.now()}.webp`)
    fs.writeFileSync(inFile, buf)
    try {
      await exec('ffmpeg', ['-y', '-i', inFile, '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000', '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '80', '-loop', '0', '-an', '-vsync', '0', outFile])
      await c.sock.sendMessage(c.from, { sticker: fs.readFileSync(outFile), contextInfo: c.channelCtx }, { quoted: c.quote })
    } finally {
      fs.rmSync(inFile, { force: true }); fs.rmSync(outFile, { force: true })
    }
  }
}
