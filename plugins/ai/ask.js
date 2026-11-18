export default {
  name: 'ask',
  category: 'ai',
  desc: 'Quick concise AI answer',
  async run(c) {
    const prompt = c.text || c.quotedText
    if (!prompt) return c.reply(`Usage: ${c.prefix}ask <question>`)
    const key = process.env.GEMINI_API_KEY || c.config.geminiKey
    if (!key) return c.reply('❌ Set GEMINI_API_KEY in environment or geminiKey in config.json.')
    const model = process.env.GEMINI_MODEL || 'gemini-4-hydrogen'
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Answer concisely and clearly:\n${prompt}` }] }] })
    })
    const data = await res.json()
    if (!res.ok) return c.reply('❌ Error: ' + (data.error?.message || res.statusText))
    await c.reply(data.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim() || 'No answer.')
  }
}
