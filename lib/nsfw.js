import fs from 'fs'
import path from 'path'
import pino from 'pino'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

// Explicit-content check using the Sightengine API (needs nsfw.json with your keys)
const MEDIA = ['imageMessage', 'stickerMessage', 'videoMessage']
export const isMedia = type => MEDIA.includes(type)

const cfg = () => { try { return JSON.parse(fs.readFileSync('nsfw.json', 'utf8')) } catch { return {} } }
export const isConfigured = () => { const c = cfg(); return !!(c.apiUser && c.apiSecret) }

// tells exactly what is wrong with nsfw.json (or null if it is fine)
export function configProblem() {
  const where = path.resolve('nsfw.json')
  let raw
  try { raw = fs.readFileSync('nsfw.json', 'utf8') }
  catch { return `File not found.\nThe bot looks for it here:\n${where}\n(it must be in the main folder, next to index.js, and named exactly nsfw.json)` }
  let c
  try { c = JSON.parse(raw) }
  catch (e) { return `The file has a typing mistake (${e.message}).\nCheck every " and , and { } in nsfw.json.` }
  if (!c.apiUser) return 'apiUser is empty in nsfw.json.'
  if (!c.apiSecret) return 'apiSecret is empty in nsfw.json.'
  return null
}

// same picture sent again and again = only one API call
const cache = new Map()
const remember = (k, v) => { cache.set(k, v); if (cache.size > 500) cache.delete(cache.keys().next().value) }

async function callApi(buf, ext, c) {
  const fd = new FormData()
  fd.append('media', new Blob([buf]), 'media.' + ext)
  fd.append('models', 'nudity-2.1')
  fd.append('api_user', c.apiUser)
  fd.append('api_secret', c.apiSecret)
  const res = await fetch('https://api.sightengine.com/1.0/check.json', {
    method: 'POST', body: fd, signal: AbortSignal.timeout(15000)
  })
  const j = await res.json()
  if (j.status !== 'success') throw new Error(j.error?.message || 'Sightengine error')
  const n = j.nudity || {}
  return Math.max(n.sexual_activity || 0, n.sexual_display || 0, n.erotica || 0)
}

// returns a score 0..1 (1 = surely explicit), or null if it could not be checked
export async function explicitScore(sock, m, content, type) {
  const c = cfg()
  if (!c.apiUser || !c.apiSecret) return null
  const msg = content[type]
  const sha = msg.fileSha256 ? Buffer.from(msg.fileSha256).toString('base64') : null
  if (sha && cache.has(sha)) return cache.get(sha)

  let buf = null, ext = 'jpg'
  if (type === 'videoMessage') {
    // videos: check the small preview picture that comes with the message
    if (msg.jpegThumbnail) buf = Buffer.from(msg.jpegThumbnail)
  } else {
    ext = type === 'stickerMessage' ? 'webp' : 'jpg'
    if (Number(msg.fileLength || 0) <= 4 * 1024 * 1024) {
      try {
        buf = await downloadMediaMessage(m, 'buffer', {}, {
          logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage
        })
      } catch (e) { console.log('nsfw download error:', e.message) }
    }
    if ((!buf || !buf.length) && msg.jpegThumbnail) { buf = Buffer.from(msg.jpegThumbnail); ext = 'jpg' }
  }
  if (!buf || !buf.length) return null

  const s = await callApi(buf, ext, c)
  if (sha) remember(sha, s)
  return s
}

export async function isExplicit(sock, m, content, type) {
  const s = await explicitScore(sock, m, content, type)
  const t = Number(cfg().threshold) || 0.8
  return s !== null && s >= t
}
