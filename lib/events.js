import fs from 'fs'
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
const nowTime = () => new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true })

export function welcomeText(tags, subject, total) {
  return `🕊️💞━━━✦❖✦━━━💞🕊️

👋 *Welcome* ${tags}
🏷️ *Group:* ${subject}
👥 *Total Members:* ${total}

🌼 তোমাকে পেয়ে মনে হচ্ছে ঠিক যেন একটা ফুল ফুঁটে উঠেছে 🌼
💬 ধন্যবাদ আমাদের পরিবারে যোগ দেওয়ার জন্য — তুমি এখন আমাদের হৃদয়ের অংশ 💖
✨ চলো শুরু করি একসাথে কিছু মিষ্টি আড্ডার মুহূর্ত ✨
꧁💝 *❛❛ Feelings never fade 🦋 ❜❜*
*Some memories stay forever… even when people don’t ✨🌸💙*💝꧂
🩵━━━⋆★⋆━━━🩵
🌸 *✨ POWERED BY ${config.botName}* 💖
🩷━━━⋆★⋆━━━🩷`
}

export function goodbyeText(tags, subject, total) {
  return `👋 *Goodbye* ${tags}
🏷️ *Group:* ${subject}
👥 *Total Members:* ${total}

*❛❛ Feelings never fade 🦋 ❜❜*
*Some memories stay forever… even when people don’t ✨🌸💙*
*This was a fun hangout group ⎯⃝🥹🍃💘*
*We shared laughs, late-night talks & moments 🦚🌻.*
*Don’t forget us ☝️🥹🍒🤌*
*~⎯͢⎯⃝💞 Come back again!~*
*Your presence will be missed tonight 🫵🥹💖🦚*
*Thanks for being with us ❤‍🩹🌺*

⏰ Time : ${nowTime()}

╰━━━━━━━━━━━━━━╯

*✨ POWERED BY ${config.botName}*`
}

// Picture for the card: member's profile pic -> group pic -> bot's own pic -> menu image
async function pictureOf(sock, jid, groupId) {
  for (const j of [jid, groupId, sock.user?.id]) {
    if (!j) continue
    try { const url = await sock.profilePictureUrl(j, 'image'); if (url) return { url } } catch {}
  }
  const m = config.menuImage
  if (m) {
    if (/^https?:/i.test(m)) return { url: m }
    try { return fs.readFileSync(m) } catch {}
  }
  return null
}

async function sendCard(sock, id, text, mentions, picJid) {
  const image = await pictureOf(sock, picJid, id)
  if (image) {
    try {
      return await sock.sendMessage(id, { image, caption: text, mentions, contextInfo: channelCtx })
    } catch (e) { console.log('welcome/goodbye image error:', e.message) }
  }
  return sock.sendMessage(id, { text, mentions, contextInfo: channelCtx })
}

export async function handleGroupEvent(sock, { id, participants, action, author }) {
  const g = db.group(id)
  const meta = await sock.groupMetadata(id).catch(() => null)
  const subject = meta?.subject || 'this group'
  const total = meta?.participants.length ?? '-'
  const jids = participants.map(p => typeof p === 'string' ? p : (p.phoneNumber || p.id))
  const tags = jids.map(j => '@' + num(j)).join(', ')

  if (action === 'add' && g.welcome)
    await sendCard(sock, id, welcomeText(tags, subject, total), jids, jids[0])

  if (action === 'remove' && g.goodbye)
    await sendCard(sock, id, goodbyeText(tags, subject, total), jids, jids[0])

  if ((action === 'promote' || action === 'demote') && g.adminEvents !== false && author) {
    const by = typeof author === 'string' ? author : (author.phoneNumber || author.id)
    await sock.sendMessage(id, {
      text: `┌─〔 🎉 *Admin Event* 〕\n├ @${num(by)} has ${action}d ${tags}\n├ Group: ${subject}\n└─➤`,
      mentions: [by, ...jids], contextInfo: channelCtx
    })
  }
}
