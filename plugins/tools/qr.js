export default {
  name: 'qr',
  category: 'tools',
  desc: 'Generate a QR code image from text or URL',
  async run(c) {
    const txt = c.text || c.quotedText
    if (!txt) return c.reply(`Usage: ${c.prefix}qr <text or link>`)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(txt)}`
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    await c.sock.sendMessage(c.from, { image: buf, caption: `📱 *QR Code for:* ${txt}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
