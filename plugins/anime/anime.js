export default {
  name: 'anime',
  category: 'anime',
  desc: 'Search anime info from MyAnimeList',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}anime <title>`)
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(c.text)}&limit=1`)
    const a = (await res.json())?.data?.[0]
    if (!a) return c.reply('❌ Anime not found.')
    const caption = `🌸 *${a.title}*\n• *Episodes:* ${a.episodes || '?'}\n• *Score:* ⭐ ${a.score || 'N/A'}\n• *Status:* ${a.status}\n\n${(a.synopsis || '').slice(0, 350)}...`
    await c.sock.sendMessage(c.from, { image: { url: a.images.jpg.large_image_url }, caption, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
