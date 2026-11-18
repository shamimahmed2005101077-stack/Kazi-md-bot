export default {
  name: 'warnings',
  category: 'admin',
  desc: 'Check warnings count of a member or group',
  groupOnly: true, adminOnly: true,
  async run(c) {
    const w = c.group.warns || {}
    if (c.targets[0]) {
      const t = c.targets[0]
      return c.reply(`⚠️ @${t.split('@')[0]} has *${w[t] || 0}/3* warnings.`, { mentions: [t] })
    }
    const entries = Object.entries(w).filter(([, v]) => v > 0)
    if (!entries.length) return c.reply('✅ No active warnings in this group.')
    const list = entries.map(([j, n]) => `• @${j.split('@')[0]}: *${n}/3*`).join('\n')
    await c.reply(`⚠️ *Group Warnings:*\n\n${list}`, { mentions: entries.map(([j]) => j) })
  }
}
