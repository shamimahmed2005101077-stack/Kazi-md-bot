export default {
  name: 'logo',
  category: 'maker',
  desc: 'Create a custom neon cyber logo image',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}logo <your text>`)
    const prompt = `3D glowing neon purple and cyan esports logo text "${c.text}" on dark obsidian background, crisp typography`
    const res = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true`)
    if (!res.ok) return c.reply('❌ Logo service unavailable right now.')
    await c.sock.sendMessage(c.from, { image: Buffer.from(await res.arrayBuffer()), caption: `🎨 *Logo:* ${c.text}`, contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
