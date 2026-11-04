import { normalizeMessageContent, getContentType, jidNormalizedUser } from '@whiskeysockets/baileys'
import { config } from './config.js'
import { commands, autos } from './loader.js'
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

// Quote shown above every bot reply: only the OWNER's number + profile picture
// ("<number> • Status" header). Nothing from the person who sent the command.
function fakeQuote(ownerNum, name) {
  const jid = ownerNum + '@s.whatsapp.net'
  return {
    key: { remoteJid: 'status@broadcast', fromMe: false, id: 'KAZI' + Date.now(), participant: jid },
    message: {
      contactMessage: {
        displayName: name,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;waid=${ownerNum}:+${ownerNum}\nEND:VCARD`
      }
    }
  }
}

export async function handleMessage(sock, m) {
  if (!m.message || m.key.remoteJid === 'status@broadcast') return
  const content = normalizeMessageContent(m.message)
  if (!content) return
  const type = getContentType(content)
  const body = content.conversation || content.extendedTextMessage?.text ||
    content.imageMessage?.caption || content.videoMessage?.caption || ''

  const from = m.key.remoteJid
  const isGroup = from.endsWith('@g.us')
  const botJid = jidNormalizedUser(sock.user.id)
  const botIds = [botJid, sock.user.lid && jidNormalizedUser(sock.user.lid)].filter(Boolean)
  const sender = jidNormalizedUser(m.key.fromMe ? botJid : (m.key.participant || from))
  const senderIds = [sender, m.key.participantAlt && jidNormalizedUser(m.key.participantAlt)].filter(Boolean)
  const group = isGroup ? db.group(from) : null

  const prefix = config.prefixes.find(p => body.startsWith(p))
  let cmd = null, args = []
  if (prefix) {
    const parts = body.slice(prefix.length).trim().split(/\s+/)
    cmd = commands.get((parts.shift() || '').toLowerCase())
    args = parts
  }
  if (!cmd && !group?.antilink && !autos.length) return

  const meta = (isGroup && (cmd || group?.antilink)) ? await sock.groupMetadata(from).catch(() => null) : null
  const idsOf = p => [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(jidNormalizedUser)
  const isAdminJid = jid => !!meta?.participants.some(p => p.admin && idsOf(p).includes(jidNormalizedUser(jid)))
  const isAdmin = senderIds.some(isAdminJid)
  const isBotAdmin = botIds.some(isAdminJid)
  const ownerNum = String(config.ownerNumber).replace(/\D/g, '')
  const isOwner = !!m.key.fromMe || senderIds.some(j => j.split('@')[0] === ownerNum)

  // ---- Anti-link ----
  if (group?.antilink && isGroup && !isAdmin && !isOwner && /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(body)) {
    if (isBotAdmin) {
      await sock.sendMessage(from, { delete: m.key }).catch(() => {})
      await sock.groupParticipantsUpdate(from, [m.key.participant], 'remove').catch(() => {})
    }
    return
  }
  if (!cmd && !autos.length) return

  const quote = fakeQuote(ownerNum, config.ownerName || 'Shamim Ahmed')
  const reply = (text, extra = {}) =>
    sock.sendMessage(from, { text, contextInfo: channelCtx, ...extra }, { quoted: quote })

  const ci = content[type]?.contextInfo
  const mentioned = ci?.mentionedJid || []
  const targets = mentioned.length ? mentioned : (ci?.participant ? [ci.participant] : [])
  const qm = ci?.quotedMessage
  const quotedText = qm?.conversation || qm?.extendedTextMessage?.text || qm?.imageMessage?.caption || ''

  const ctx = {
    sock, m, from, sender, isGroup, meta, group, args, body, text: args.join(' '), prefix, config, db,
    isOwner, isAdmin, isBotAdmin, isAdminJid, botJid, targets, quotedText, quote, channelCtx, reply
  }

  // ---- Normal message (no command): let auto-reply plugins answer ----
  if (!cmd) {
    for (const a of autos) {
      try { if (await a.auto(ctx)) break }
      catch (e) { console.log(`auto ${a.name} error:`, e.message) }
    }
    return
  }

  if (cmd.ownerOnly && !isOwner) return reply('❌ Owner only command.')
  if (cmd.groupOnly && !isGroup) return reply('❌ This command works in groups only.')
  if (cmd.adminOnly && !(isAdmin || isOwner)) return reply('❌ Only group admins can use this command.')
  if (cmd.botAdmin && !isBotAdmin) return reply('❌ Please make me a group admin first.')

  try { await cmd.run(ctx) }
  catch (e) { console.log(`cmd ${cmd.name} error:`, e); await reply('⚠️ Error: ' + e.message).catch(() => {}) }
}
