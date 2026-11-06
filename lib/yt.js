import fs from 'fs'
import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export const MAX_SECONDS = 600     // 10 minutes (keeps RAM usage low on a small server)
let busy = false                    // one download at a time

// Optional: put a cookies.json (exported from a THROWAWAY YouTube account) in the main folder
let agent
try {
  if (fs.existsSync('cookies.json')) agent = ytdl.createAgent(JSON.parse(fs.readFileSync('cookies.json', 'utf8')))
} catch (e) { console.log('cookies.json problem:', e.message) }

function reasonOf(e) {
  const msg = String(e?.message || e)
  if (/not a bot|sign in to confirm/i.test(msg)) return 'YouTube blocked this server ("confirm you\'re not a bot"). This is common on hosting servers.'
  if (/429|too many|rate/i.test(msg)) return 'YouTube is limiting this server for now. Try again later.'
  if (/timeout/i.test(msg)) return 'The download took too long.'
  if (/age/i.test(msg)) return 'This video is age-restricted.'
  if (/private|unavailable|not available|region/i.test(msg)) return 'This video is not available.'
  return msg.slice(0, 120)
}

async function findVideo(q) {
  if (/(youtube\.com|youtu\.be)\//i.test(q) && ytdl.validateURL(q))
    return await yts({ videoId: ytdl.getURLVideoID(q) })
  const r = await yts(q)
  return r.videos?.[0]
}

async function downloadAudio(url) {
  const stream = ytdl(url, {
    quality: 'highestaudio',
    filter: f => f.hasAudio && !f.hasVideo && f.container === 'mp4',   // m4a plays everywhere
    highWaterMark: 1 << 24,
    ...(agent ? { agent } : {})
  })
  const chunks = []
  for await (const ch of stream) chunks.push(ch)
  return Buffer.concat(chunks)
}

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

// asFile = true  -> sent as a downloadable audio file (.song)
// asFile = false -> sent as a normal playable audio message (.play)
export async function sendMusic(c, { asFile, usage }) {
  if (!c.text) return c.reply(`🎵 Usage: ${c.prefix}${usage} <song name or YouTube link>`)
  if (busy) return c.reply('⏳ Another song is downloading, please try again in a moment.')
  busy = true
  try {
    await c.reply('🔎 Searching...')
    const v = await findVideo(c.text)
    if (!v) return c.reply('❌ Nothing found. Try a different name.')
    const url = v.url || `https://youtu.be/${v.videoId}`
    if (v.seconds > MAX_SECONDS) return c.reply(`⚠️ This is too long (${v.timestamp}). Maximum is 10 minutes.`)

    const caption = `🎵 *${v.title}*\n⏱ ${v.timestamp}\n👤 ${v.author?.name || ''}\n\n⏬ Downloading...`
    if (v.thumbnail)
      await c.sock.sendMessage(c.from, { image: { url: v.thumbnail }, caption, contextInfo: c.channelCtx }, { quoted: c.quote }).catch(() => {})
    else await c.reply(caption)

    let buf
    try { buf = await withTimeout(downloadAudio(url), 120000) }
    catch (e) {
      console.log('music download error:', e.message)
      return c.reply(`❌ Could not download the song.\n\n*Reason:* ${reasonOf(e)}\n\n🔗 ${url}`)
    }
    if (asFile) {
      const fileName = v.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 80) + '.m4a'
      await c.sock.sendMessage(c.from, { document: buf, mimetype: 'audio/mp4', fileName }, { quoted: c.quote })
    } else {
      await c.sock.sendMessage(c.from, { audio: buf, mimetype: 'audio/mp4', ptt: false }, { quoted: c.quote })
    }
  } finally { busy = false }
}
