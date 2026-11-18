export default {
  name: 'waifu',
  category: 'anime',
  desc: 'Send a random anime waifu image',
  async run(c) {
    const data = await (await fetch('https://api.waifu.pics/sfw/waifu')).json()
    await c.sock.sendMessage(c.from, { image: { url: data.url }, caption: '🌸 *Random Waifu*', contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
