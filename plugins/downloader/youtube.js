import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export default {
  name: 'youtube',
  aliases: ['yt', 'ytmp4'],
  category: 'downloader',
  desc: 'Download YouTube video by link or search',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}youtube <url or search query>`)
    await c.reply('⏳ Searching YouTube...')
    let videoUrl = c.args[0], title = 'YouTube Video'
    if (!ytdl.validateURL(videoUrl)) {
      const s = await yts(c.text)
      if (!s.videos.length) return c.reply('❌ No video found.')
      videoUrl = s.videos[0].url
      title = s.videos[0].title
    }
    const info = await ytdl.getInfo(videoUrl)
    title = info.videoDetails.title
    const fmt = ytdl.chooseFormat(info.formats, { quality: '18', filter: 'audioandvideo' }) || ytdl.chooseFormat(info.formats, { filter: 'audioandvideo' })
    if (!fmt?.url) return c.reply('❌ No downloadable video stream found.')
    const chunks = []
    for await (const ch of ytdl.downloadFromInfo(info, { format: fmt })) chunks.push(ch)
    await c.sock.sendMessage(c.from, { video: Buffer.concat(chunks), caption: `🎬 *${title}*`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
