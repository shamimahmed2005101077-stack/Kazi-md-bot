export default {
  name: 'fact',
  category: 'fun',
  desc: 'Get a random interesting fact',
  async run(c) {
    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    const data = await res.json()
    await c.reply(`💡 *Did You Know?*\n\n${data.text}`)
  }
}
