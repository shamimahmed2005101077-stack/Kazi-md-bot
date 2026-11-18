export default {
  name: 'ship',
  category: 'fun',
  desc: 'Calculate love compatibility between two users',
  async run(c) {
    const u1 = c.targets[0] || c.sender
    const u2 = c.targets[1] || (c.targets[0] ? c.sender : null)
    if (!u2) return c.reply(`Tag two users or one user to ship! Example: ${c.prefix}ship @user`)
    const pct = Math.floor(Math.random() * 101)
    const bar = '❤️'.repeat(Math.round(pct / 20)) + '🖤'.repeat(5 - Math.round(pct / 20))
    await c.reply(`💘 *LOVE METER*\n\n@${u1.split('@')[0]} + @${u2.split('@')[0]}\n${bar} *${pct}%*`, { mentions: [u1, u2] })
  }
}
