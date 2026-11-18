export default {
  name: 'emojimix',
  category: 'maker',
  desc: 'Mix two emojis into a sticker image',
  async run(c) {
    const [e1, e2] = c.text.includes('+') ? c.text.split('+').map(s => s.trim()) : [...c.text.trim()]
    if (!e1 || !e2) return c.reply(`Usage: ${c.prefix}emojimix 😎+🔥`)
    const cp = e => [...e].map(x => x.codePointAt(0).toString(16)).join('-')
    const urls = [
      `https://emojik.vercel.app/s/${cp(e1)}_${cp(e2)}?size=256`,
      `https://tenor.googleapis.com/v2/featured`
    ]
    const res = await fetch(urls[0])
    if (!res.ok) return c.reply('❌ That emoji combination is not supported.')
    const buf = Buffer.from(await res.arrayBuffer())
    await c.sock.sendMessage(c.from, { image: buf, caption: `✨ ${e1} + ${e2}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
