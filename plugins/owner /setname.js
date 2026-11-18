import fs from 'fs'

export default {
  name: 'setname',
  category: 'owner',
  desc: 'Change WhatsApp profile name & botName',
  ownerOnly: true,
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}setname <new name>`)
    await c.sock.updateProfileName(c.text)
    c.config.botName = c.text
    fs.writeFileSync(new URL('../../config.json', import.meta.url), JSON.stringify(c.config, null, 2))
    await c.reply(`✅ Bot name updated to *${c.text}*`)
  }
}
