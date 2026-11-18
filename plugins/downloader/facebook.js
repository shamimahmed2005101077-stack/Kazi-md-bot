export default {
  name: 'facebook',
  aliases: ['fb'],
  category: 'downloader',
  desc: 'Download Facebook video from URL',
  async run(c) {
    const url = c.args[0]
    if (!url || !/facebook\.com|fb\.watch/i.test(url)) return c.reply(`Usage: ${c.prefix}facebook <facebook_url>`)
    await c.reply('⏳ Fetching Facebook video...')
    const res = await fetch(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`)
    const data = await res.json().catch(() => null)
    const videoUrl = data?.data?.[0]?.url || data?.hd || data?.sd || data?.url
    if (!videoUrl) return c.reply('❌ Unable to extract Facebook video. Link may be private.')
    await c.sock.sendMessage(c.from, { video: { url: videoUrl }, caption: '📥 *Facebook Video*', contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
