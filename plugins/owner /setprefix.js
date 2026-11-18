import fs from 'fs'

export default {
  name: 'setprefix',
  category: 'owner',
  desc: 'Change bot command prefixes',
  ownerOnly: true,
  async run(c) {
    if (!c.text) return c.reply(`Current prefixes: ${c.config.prefixes.join(' ')}\nUsage: ${c.prefix}setprefix . ! / #`)
    const list = c.text.split(/[\s,]+/).filter(Boolean)
    c.config.prefixes = list
    fs.writeFileSync(new URL('../../config.json', import.meta.url), JSON.stringify(c.config, null, 2))
    await c.reply(`✅ Prefixes updated to: *${list.join(' ')}*`)
  }
}
