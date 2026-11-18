export default {
  name: 'character',
  aliases: ['char'],
  category: 'anime',
  desc: 'Search anime character info',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}character <name>`)
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(c.text)}&limit=1`)
    const ch = (await res.json())?.data?.[0]
    if (!ch) return c.reply('❌ Character not found.')
    const caption = `✨ *${ch.name}* (${ch.name_kanji || ''})\n❤️ *Favorites:* ${ch.favorites}\n\n${(ch.about || 'No bio').slice(0, 400)}`
    await c.sock.sendMessage(c.from, { image: { url: ch.images.jpg.image_url }, caption, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
