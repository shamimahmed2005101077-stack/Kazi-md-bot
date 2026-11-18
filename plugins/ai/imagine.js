export default {
  name: 'imagine',
  category: 'ai',
  desc: 'Generate an AI image from text prompt',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}imagine <description>`)
    await c.reply('🎨 Generating your image...')
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(c.text)}?width=1024&height=1024&nologo=true`
    const res = await fetch(url)
    if (!res.ok) return c.reply('❌ Failed to generate image. Try again later.')
    const buf = Buffer.from(await res.arrayBuffer())
    await c.sock.sendMessage(c.from, { image: buf, caption: `🖼️ *Prompt:* ${c.text}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
