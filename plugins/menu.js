import fs from 'fs'
import { buildMenu } from '../../lib/menu.js'

export default {
  name: 'menu', aliases: ['help', 'list'], category: 'general', desc: 'Show all commands',
  async run(c) {
    const text = buildMenu()
    const img = c.config.menuImage
    if (img) {
      try {
        const image = /^https?:/.test(img) ? { url: img } : fs.readFileSync(img)
        return await c.sock.sendMessage(c.from, { image, caption: text, contextInfo: c.channelCtx }, { quoted: c.quote })
      } catch (e) { console.log('Menu image error:', e.message) }
    }
    await c.reply(text)
  }
}
