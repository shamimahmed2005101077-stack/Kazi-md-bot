export default {
  name: 'summarize',
  category: 'ai',
  desc: 'Summarize long text or replied message',
  async run(c) {
    const input = c.text || c.quotedText
    if (!input) return c.reply(`Reply to a long text or type: ${c.prefix}summarize <text>`)
    const key = process.env.GEMINI_API_KEY || c.config.geminiKey
    if (!key) return c.reply('❌ Set GEMINI_API_KEY in environment or geminiKey in config.json.')
    const model = process.env.GEMINI_MODEL || 'gemini-4-hydrogen'
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize in clear bullet points:\n\n${input}` }] }] })
    })
    const data = await res.json()
    if (!res.ok) return c.reply('❌ Error: ' + (data.error?.message || res.statusText))
    const out = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'Could not summarize.'
    await c.reply(`📝 *Summary:*\n\n${out.trim()}`)
  }
}
