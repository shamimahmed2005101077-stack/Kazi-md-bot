import { config } from './config.js'
import { db } from './db.js'

const channelCtx = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: config.newsletterJid,
    newsletterName: config.newsletterName,
    serverMessageId: 143
  }
}
const num = j => j.split('@')[0].split(':')[0]

export async function handleGroupEvent(sock, { id, participants, action, author }) {
  const g = db.group(id)
  const meta = await sock.groupMetadata(id).catch(() => null)
  const subject = meta?.subject || 'this group'
  const jids = participants.map(p => typeof p === 'string' ? p : (p.phoneNumber || p.id))
  const tags = jids.map(j => '@' + num(j)).join(', ')
  const send = (text, mentions) => sock.sendMessage(id, { text, mentions, contextInfo: channelCtx })

  if (action === 'add' && g.welcome) {
    await send(
`╭───〔 👋 *WELCOME* 〕───
│
│ Hello ${tags}! 🎉
│ Welcome to *${subject}*
│ 👥 Members: ${meta?.participants.length ?? '-'}
│
│ Please read the group rules,
│ be respectful and enjoy your stay.
│
╰──────────────────`, jids)
  }

  if (action === 'remove' && g.goodbye) {
    await send(
`╭───〔 👋 *GOODBYE* 〕───
│
│ ${tags} has left *${subject}*.
│ We wish you all the best! 🌹
│
╰──────────────────`, jids)
  }

  if ((action === 'promote' || action === 'demote') && g.adminEvents !== false && author) {
    const by = typeof author === 'string' ? author : (author.phoneNumber || author.id)
    await send(
`┌─〔 🎉 *Admin Event* 〕
├ @${num(by)} has ${action}d ${tags}
├ Group: ${subject}
└─➤`, [by, ...jids])
  }
}
