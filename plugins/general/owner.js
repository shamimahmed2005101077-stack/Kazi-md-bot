export default {
  name: 'owner', category: 'general', desc: 'Send the owner contact',
  async run(c) {
    const n = String(c.config.ownerNumber).replace(/\D/g, '')
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Owner\nTEL;type=CELL;waid=${n}:+${n}\nEND:VCARD`
    await c.sock.sendMessage(c.from, { contacts: { displayName: 'Owner', contacts: [{ vcard }] } }, { quoted: c.quote })
  }
}
