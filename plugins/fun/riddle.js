export default {
  name: 'riddle',
  category: 'fun',
  desc: 'Get a brain-teaser riddle',
  async run(c) {
    const res = await fetch('https://riddles-api.vercel.app/random')
    const data = await res.json()
    await c.reply(`🧩 *Riddle:*\n${data.riddle}\n\n||*Answer:* ${data.answer}||`)
  }
}
