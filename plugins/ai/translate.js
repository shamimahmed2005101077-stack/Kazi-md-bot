export default {
  name: 'translate',
  aliases: ['tr'],
  category: 'ai',
  desc: 'Translate text to any language (default: en)',
  async run(c) {
    let lang = 'en', text = c.quotedText
    if (c.args[0] && c.args[0].length <= 5 && c.args.length > 1) {
      lang = c.args[0].toLowerCase()
      text = c.args.slice(1).join(' ')
    } else if (c.text) {
      if (c.args[0]?.length <= 5 && c.quotedText) { lang = c.args[0].toLowerCase(); text = c.quotedText }
      else text = c.text
    }
    if (!text) return c.reply(`Usage: ${c.prefix}translate <lang_code> <text> or reply to a message`)
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`)
    const data = await res.json()
    const translated = (data?.[0] || []).map(x => x[0]).join('')
    await c.reply(`🌐 *Translated (${data?.[2] || 'auto'} → ${lang}):*\n\n${translated || 'Failed'}`)
  }
}
