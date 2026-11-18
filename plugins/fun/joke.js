export default {
  name: 'joke',
  category: 'fun',
  desc: 'Get a random joke',
  async run(c) {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke')
    const j = await res.json()
    await c.reply(`😂 *Joke:*\n\n${j.setup}\n\n👉 _${j.punchline}_`)
  }
}
