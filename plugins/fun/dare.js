export default {
  name: 'dare',
  category: 'fun',
  desc: 'Get a Dare challenge',
  async run(c) {
    const res = await fetch('https://api.truthordarebot.xyz/v1/dare')
    const data = await res.json()
    await c.reply(`🔥 *DARE:*\n\n${data.question}`)
  }
}
