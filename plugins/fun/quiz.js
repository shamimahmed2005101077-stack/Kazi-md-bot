export default {
  name: 'quiz',
  category: 'fun',
  desc: 'Play a trivia quiz question',
  async run(c) {
    const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple')
    const data = await res.json()
    const q = data?.results?.[0]
    if (!q) return c.reply('❌ Failed to load quiz.')
    const decode = s => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')
    const opts = [...q.incorrect_answers, q.correct_answer].map(decode).sort(() => Math.random() - 0.5)
    await c.reply(`🎯 *TRIVIA QUIZ (${q.category})*\n\n${decode(q.question)}\n\n${opts.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n✅ *Answer:* ||${decode(q.correct_answer)}||`)
  }
}
