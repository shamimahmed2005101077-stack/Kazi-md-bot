export default {
  name: 'tiktok',
  aliases: ['tt'],
  category: 'downloader',
  desc: 'Download TikTok video without watermark',
  async run(c) {
    const url = c.args[0]
    if (!url || !/tiktok\.com/i.test(url)) return c.reply(`Usage: ${c.prefix}tiktok <tiktok_url>`)
    await c.reply('⏳ Downloading TikTok video...')
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)
    const json = await res.json().catch(() => null)
    const videoUrl = json?.data?.play
    if (!videoUrl) return c.reply('❌ Could not fetch TikTok video.')
    await c.sock.sendMessage(c.from, { video: { url: videoUrl }, caption: `📥 *TikTok:* ${json.data.title || ''}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
