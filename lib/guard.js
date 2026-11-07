// Shared punishment for anti-link / anti-status-mention.
// mode: 'del' = delete only | 'warn' = delete + warning (removed after 3) | 'kick' = delete + remove
const MAX_WARN = 3
const recent = new Set()
const num = j => j.split('@')[0].split(':')[0]

// "This group was mentioned" in someone's status (group status mention)
export function isStatusMention(m, content) {
  const keys = [...Object.keys(m.message || {}), ...Object.keys(content || {})]
  if (keys.some(k => /statusmention|groupmentioned/i.test(k))) return true
  const pm = m.message?.protocolMessage || content?.protocolMessage
  return !!pm && (pm.type === 25 || pm.type === 'STATUS_MENTION_MESSAGE')
}

export async function punish(sock, m, mode, reason, group, db, channelCtx) {
  const from = m.key.remoteJid
  const who = m.key.participant
  if (!who) return
  const tag = '@' + num(who)
  const say = text => sock.sendMessage(from, { text, mentions: [who], contextInfo: channelCtx }).catch(() => {})

  await sock.sendMessage(from, { delete: m.key }).catch(() => {})
  if (mode === 'del') return

  if (mode === 'warn') {
    const w = (group.warns ||= {})
    const n = w[who] = (w[who] || 0) + 1
    db.save()
    if (n < MAX_WARN)
      return say(`⚠️ *Warning ${n}/${MAX_WARN}*\n${tag}, ${reason}.\nAfter ${MAX_WARN} warnings you will be removed from the group.`)
    delete w[who]; db.save()          // 3rd warning -> remove
  }

  const key = from + '|' + who
  if (recent.has(key)) return        // already removed a moment ago
  recent.add(key); setTimeout(() => recent.delete(key), 60000)
  await sock.groupParticipantsUpdate(from, [who], 'remove').catch(() => {})
  await say(`🚫 ${tag} was removed: ${reason}.`)
}
