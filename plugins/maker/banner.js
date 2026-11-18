export default {
  name: 'banner',
  category: 'maker',
  desc: 'Create a wide widescreen banner image',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}banner <title>`)
    const prompt = `Cyberpunk dark purple and blue widescreen banner with bold glowing text "${c.text}", sleek digital art`
    const res = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true`)
    if (!res.ok) return c.reply('❌ Banner service unavailable right now.')
    await c.sock.sendMessage(c.from, { image: Buffer.from(await res.arrayBuffer()), caption: `🖼️ *Banner:* ${c.text}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
