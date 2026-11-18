export default {
  name: 'instagram',
  aliases: ['ig'],
  category: 'downloader',
  desc: 'Download Instagram Reel / Post',
  async run(c) {
    const url = c.args[0]
    if (!url || !/instagram\.com/i.test(url)) return c.reply(`Usage: ${c.prefix}instagram <instagram_url>`)
    await c.reply('⏳ Fetching Instagram media...')
    const res = await fetch(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
    const data = await res.json().catch(() => null)
    const item = data?.data?.[0] || data?.result?.[0]
    const mediaUrl = item?.url || item?.download_link
    if (!mediaUrl) return c.reply('❌ Failed to download Instagram media.')
    const isImg = item?.type === 'image' || /\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl)
    await c.sock.sendMessage(c.from, isImg ? { image: { url: mediaUrl }, caption: '📥 *Instagram Image*', contextInfo: c.channelCtx } : { video: { url: mediaUrl }, caption: '📥 *Instagram Video*', contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
