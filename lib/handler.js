import { normalizeMessageContent, getContentType, jidNormalizedUser } from '@whiskeysockets/baileys'
import { config } from './config.js'
import { commands, autos } from './loader.js'
import { db } from './db.js'
import { isMedia, isExplicit } from './nsfw.js'
import { punish, isStatusMention } from './guard.js'

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

const kickedRecently = new Set()   // avoids kicking the same person twice in a row

const SEEN_TYPES = ['conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage', 'contactMessage', 'locationMessage', 'reactionMessage', 'pollCreationMessage', 'pollUpdateMessage', 'senderKeyDistributionMessage', 'messageContextInfo']

const NOT_A_MESSAGE = ['protocolMessage', 'reactionMessage', 'senderKeyDistributionMessage', 'messageContextInfo']

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
  const botNum = botJid.split('@')[0]
  const botIds = [botJid, sock.user.lid && jidNormalizedUser(sock.user.lid)].filter(Boolean)
  const sender = jidNormalizedUser(m.key.fromMe ? botJid : (m.key.participant || from))
  const senderIds = [sender, m.key.participantAlt && jidNormalizedUser(m.key.participantAlt)].filter(Boolean)
  const group = isGroup ? db.group(from) : null

  // ---- count messages per member (used by .topmember) ----
  if (isGroup && !NOT_A_MESSAGE.includes(type)) {
    const e = (group.stats[sender] ||= { n: 0, name: '' })
    e.n++
    if (m.pushName) e.name = m.pushName
    db.save()
  }

  const prefix = config.prefixes.find(p => body.startsWith(p))
  let cmd = null, args = []
  if (prefix) {
    const parts = body.slice(prefix.length).trim().split(/\s+/)
    cmd = commands.get((parts.shift() || '').toLowerCase())
    args = parts
  }
  if (prefix) console.log(`📩 got "${body.slice(0, 30)}" from ${sender.split('@')[0]} (${isGroup ? 'group' : 'private chat'}) -> ${cmd ? 'command ' + cmd.name : 'no such command'}`)
  const checkMedia = !!group?.antinsfw && !m.key.fromMe && isMedia(type)
  const statusMention = !!group?.antistatus && isStatusMention(m, content)
  if (group?.antistatus && !statusMention && !SEEN_TYPES.includes(type))
    console.log(`🔎 message type "${type}" (keys: ${Object.keys(m.message).join(', ')})`)   // helps to find the real status-mention type
  if (!cmd && !group?.antilink && !checkMedia && !statusMention && !autos.length) return

  const meta = (isGroup && (cmd || group?.antilink || checkMedia || statusMention)) ? await sock.groupMetadata(from).catch(() => null) : null
  const idsOf = p => [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(jidNormalizedUser)
  const isAdminJid = jid => !!meta?.participants.some(p => p.admin && idsOf(p).includes(jidNormalizedUser(jid)))
  const isAdmin = senderIds.some(isAdminJid)
  const isBotAdmin = botIds.some(isAdminJid)
  const ownerNum = String(config.ownerNumber).replace(/\D/g, '')
  // isSelf  = the number this bot is connected to (the real owner of this bot)
  const isSelf = !!m.key.fromMe || senderIds.some(j => j.split('@')[0] === botNum)
  const isOwner = isSelf || senderIds.some(j => j.split('@')[0] === ownerNum)

  // ---- Anti-link (action set with .antilink set kick / del / warn) ----
  if (group?.antilink && isGroup && !isAdmin && !isOwner && /chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(body)) {
    if (isBotAdmin) await punish(sock, m, group.antilinkMode || 'kick', 'group links are not allowed here', group, db, channelCtx)
    return
  }

  // ---- Anti status-mention (action set with .antistatus set kick / del / warn) ----
  if (statusMention && isGroup && !isAdmin && !isOwner) {
    console.log('🔔 status mention detected from', sender.split('@')[0])
    if (isBotAdmin) await punish(sock, m, group.antistatusMode || 'del', 'tagging this group in a status is not allowed', group, db, channelCtx)
    return
  }

  // ---- Explicit-content filter: delete + remove the sender (admins and owner are not checked) ----
  if (checkMedia && isGroup && !isAdmin && !isOwner && isBotAdmin) {
    const bad = await isExplicit(sock, m, content, type).catch(e => { console.log('nsfw check error:', e.message); return false })
    if (bad) {
      await sock.sendMessage(from, { delete: m.key }).catch(() => {})
      const kk = from + '|' + sender
      if (!kickedRecently.has(kk)) {
        kickedRecently.add(kk); setTimeout(() => kickedRecently.delete(kk), 60000)
        await sock.groupParticipantsUpdate(from, [m.key.participant || sender], 'remove').catch(() => {})
        await sock.sendMessage(from, {
          text: `🚫 *Explicit content removed*\n@${sender.split('@')[0].split(':')[0]} was removed from the group.`,
          mentions: [sender], contextInfo: channelCtx
        }).catch(() => {})
      }
      return
    }
  }

  // ---- Private mode: only the owner can use the bot ----
  if (db.bot(botNum).mode === 'private' && !isOwner) {
    if (cmd) console.log(`⛔ ignored: bot is in PRIVATE mode and ${sender.split('@')[0]} is not the owner (send .mode public from the bot's own number)`)
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
    msgType: type, botNum, isSelf, isOwner, isAdmin, isBotAdmin, isAdminJid, botJid,
    targets, quotedText, quote, channelCtx, reply
  }

  // ---- Normal message (no command): auto plugins ----
  if (!cmd) {
    for (const a of autos) {
      try { if (await a.auto(ctx)) break }
      catch (e) { console.log(`auto ${a.name} error:`, e.message) }
    }
    return
  }

  if (cmd.selfOnly && !isSelf) return reply('❌ Only the owner (the number this bot is connected to) can use this.')
  if (cmd.ownerOnly && !isOwner) return reply('❌ Owner only command.')
  if (cmd.groupOnly && !isGroup) return reply('❌ This command works in groups only.')
  if (cmd.adminOnly && !(isAdmin || isOwner)) return reply('❌ Only group admins can use this command.')
  if (cmd.botAdmin && !isBotAdmin) return reply('❌ Please make me a group admin first.')

  try { await cmd.run(ctx) }
  catch (e) { console.log(`cmd ${cmd.name} error:`, e); await reply('⚠️ Error: ' + e.message).catch(() => {}) }
}
