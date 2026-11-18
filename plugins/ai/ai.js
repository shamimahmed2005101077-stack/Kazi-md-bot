export default {
  name: 'ai',
  category: 'ai',
  desc: 'Ask Gemini AI anything',
  async run(c) {
    const prompt = c.text || c.quotedText
    if (!prompt) return c.reply(`Usage: ${c.prefix}ai <your question>`)
    const key = process.env.GEMINI_API_KEY || c.config.geminiKey
    if (!key) return c.reply('❌ Set GEMINI_API_KEY in environment or geminiKey in config.json.')
    const model = process.env.GEMINI_MODEL || 'gemini-4-hydrogen'
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const data = await res.json()
    if (!res.ok) return c.reply('❌ AI Error: ' + (data.error?.message || res.statusText))
    const out = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'No response.'
    await c.reply(`🤖 *AI Response:*\n\n${out.trim()}`)
  }
}
