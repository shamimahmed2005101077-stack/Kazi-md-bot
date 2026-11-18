export default {
  name: 'neko',
  category: 'anime',
  desc: 'Send a random anime neko image',
  async run(c) {
    const data = await (await fetch('https://api.waifu.pics/sfw/neko')).json()
    await c.sock.sendMessage(c.from, { image: { url: data.url }, caption: '🐱 *Random Neko*', contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
