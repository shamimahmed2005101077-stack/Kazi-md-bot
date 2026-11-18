export default {
  name: 'gpt',
  category: 'ai',
  desc: 'Chat with OpenAI GPT',
  async run(c) {
    const prompt = c.text || c.quotedText
    if (!prompt) return c.reply(`Usage: ${c.prefix}gpt <prompt>`)
    const key = process.env.OPENAI_API_KEY || c.config.openaiKey
    if (!key) return c.reply('❌ OPENAI_API_KEY is not configured.')
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
    })
    const data = await res.json()
    if (!res.ok) return c.reply('❌ GPT Error: ' + (data.error?.message || res.statusText))
    await c.reply(`🧠 *GPT:*\n\n${data.choices?.[0]?.message?.content?.trim() || 'No response.'}`)
  }
}
