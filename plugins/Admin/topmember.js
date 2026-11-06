const MEDALS = ['🥇', '🥈', '🥉']

export default {
  name: 'topmember', aliases: ['topmembers', 'top'], category: 'admin',
  desc: 'Most active members (shows 5, or the number you write)',
  groupOnly: true, adminOnly: true,

  // the bot counts every member's messages automatically (see lib/handler.js)
  async run(c) {
    const n = Math.min(Math.max(parseInt(c.args[0]) || 5, 1), 30)
    const list = Object.entries(c.group.stats || {})
      .map(([jid, e]) => ({ jid, n: e.n }))
      .sort((a, b) => b.n - a.n).slice(0, n)
    if (!list.length) return c.reply("📊 No activity recorded yet. I count members' messages from now on.")
    let t = `🏆 *TOP ${list.length} ACTIVE MEMBERS*\n🏷️ ${c.meta?.subject || 'Group'}\n\n`
    list.forEach((x, i) => { t += `${MEDALS[i] || (i + 1) + '.'} @${x.jid.split('@')[0].split(':')[0]} — ${x.n} messages\n` })
    t += `\n💡 Use ${c.prefix}topmember 10 to see the top 10`
    await c.reply(t, { mentions: list.map(x => x.jid) })
  }
}
