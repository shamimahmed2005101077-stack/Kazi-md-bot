const num = j => j.split('@')[0].split(':')[0]

export default {
  name: 'groupinfo', aliases: ['gcinfo', 'ginfo'], category: 'group', desc: 'Show information about this group',
  groupOnly: true,
  async run(c) {
    const m = c.meta
    if (!m) return c.reply('⚠️ Could not read the group information. Try again.')
    const admins = m.participants.filter(p => p.admin).length
    const created = m.creation
      ? new Date(m.creation * 1000).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'long', year: 'numeric' })
      : 'unknown'
    const creator = m.ownerPn || m.owner
    let link = ''
    try { link = 'https://chat.whatsapp.com/' + await c.sock.groupInviteCode(c.from) } catch {}

    const text =
`◈╭─❍「 *GROUP INFO* 」❍
◈├• 🏷️ *Name:* ${m.subject}
◈├• 🆔 *ID:* ${c.from.split('@')[0]}
◈├• 👥 *Members:* ${m.participants.length}
◈├• 🛡️ *Admins:* ${admins}
◈├• 👑 *Creator:* ${creator ? '@' + num(creator) : 'unknown'}
◈├• 📅 *Created:* ${created}
◈├• 💬 *Who can send:* ${m.announce ? 'only admins' : 'everyone'}
◈├• ✏️ *Who can edit info:* ${m.restrict ? 'only admins' : 'everyone'}
${link ? `◈├• 🔗 *Invite link:* ${link}\n` : ''}◈╰──★─☆──♪♪─❍
${m.desc ? `\n📝 *Description:*\n${m.desc}` : ''}`

    const mentions = creator ? [creator] : []
    let url = null
    try { url = await c.sock.profilePictureUrl(c.from, 'image') } catch {}
    if (url) {
      try { return await c.sock.sendMessage(c.from, { image: { url }, caption: text, mentions, contextInfo: c.channelCtx }, { quoted: c.quote }) } catch {}
    }
    await c.reply(text, { mentions })
  }
}
