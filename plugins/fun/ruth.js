export default {
  name: 'truth',
  category: 'fun',
  desc: 'Get a Truth question',
  async run(c) {
    const res = await fetch('https://api.truthordarebot.xyz/v1/truth')
    const data = await res.json()
    await c.reply(`🤫 *TRUTH:*\n\n${data.question}`)
  }
}
