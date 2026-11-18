export default {
  name: 'quote',
  category: 'fun',
  desc: 'Get an inspirational quote',
  async run(c) {
    const res = await fetch('https://zenquotes.io/api/random')
    const data = await res.json()
    const q = data?.[0]
    await c.reply(`💬 _"${q?.q || 'Keep moving forward.'}"_\n\n— *${q?.a || 'Unknown'}*`)
  }
}
