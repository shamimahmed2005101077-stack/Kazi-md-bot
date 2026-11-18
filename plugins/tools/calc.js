export default {
  name: 'calc',
  category: 'tools',
  desc: 'Calculate a mathematical expression safely',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}calc (25 * 4) + 12`)
    const expr = c.text.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**')
    if (!/^[0-9+\-*/().%\s]+$/.test(expr)) return c.reply('❌ Only numbers and + - * / ( ) % ^ are allowed.')
    try {
      const result = Function(`"use strict"; return (${expr})`)()
      if (!Number.isFinite(result)) return c.reply('❌ Invalid calculation (e.g. division by zero).')
      await c.reply(`🧮 *Result:*\n\`${c.text}\` = *${result}*`)
    } catch {
      await c.reply('❌ Invalid mathematical syntax.')
    }
  }
}
