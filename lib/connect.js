import fs from 'fs'
import path from 'path'
import pino from 'pino'
import makeWASocket, {
  useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers
} from '@whiskeysockets/baileys'
import { handleMessage } from './handler.js'
import { handleGroupEvent } from './events.js'

const sessions = new Map()
export const hasSession = n => sessions.has(n)

export async function startSession(number, notify = {}) {
  const dir = path.join('sessions', number)
  const { state, saveCreds } = await useMultiFileAuthState(dir)

  // leftover half-paired session with nobody waiting for a code -> clean up
  if (!state.creds.registered && !notify.onCode) {
    fs.rmSync(dir, { recursive: true, force: true })
    return
  }

  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false
  })
  sessions.set(number, sock)
  let opened = false

  sock.ev.on('creds.update', saveCreds)

  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const raw = await sock.requestPairingCode(number)
        notify.onCode(raw.match(/.{1,4}/g).join('-'))
      } catch (e) {
        console.log('pairing error:', e.message)
        notify.onError?.(e)
        sessions.delete(number)
        fs.rmSync(dir, { recursive: true, force: true })
        try { sock.end(undefined) } catch {}
      }
    }, 3000)
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`✅ ${number} connected`)
      if (!opened) { opened = true; notify.onOpen?.(sock.user.id) }
    }
    if (connection === 'close') {
      if (sessions.get(number) !== sock) return
      sessions.delete(number)
      const code = lastDisconnect?.error?.output?.statusCode
      console.log(`🔄 ${number} closed (code ${code})`)
      if (code === DisconnectReason.loggedOut) {
      fs.rmSync(dir, { recursive: true, force: true })
        return
      }
      setTimeout(() => startSession(number, opened ? {} : { onOpen: notify.onOpen }).catch(console.error), 3000)
    }
  })

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return
    for (const m of messages) handleMessage(sock, m).catch(e => console.log('handler error:', e.message))
  })
  sock.ev.on('group-participants.update', ev =>
    handleGroupEvent(sock, ev).catch(e => console.log('group event error:', e.message)))
}
