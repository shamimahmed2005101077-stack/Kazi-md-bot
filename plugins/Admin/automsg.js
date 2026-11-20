import { db } from '../../lib/db.js'
import { config } from '../../lib/config.js'

const MESSAGES = {
  0: ['~ এখন রাত ১২টা বেজে গেলো সবাই শুয়ে পড়ো🤟'],
  1: ['~এখন রাত ১টা বাজে প্রেম না কইরা যাইয়া ঘুমা বেক্কল😾'],
  2: ['~এখন রাত ২টা বাজে যারা ছ্যাকা খাইছে তারা জেগে আছে🫠🫠।'],
  3: ['~এখন রাত ৩টা বাজে সবাই মনে হয় ঘুম🥹 আমার ভাই ঘুম আসে না'],
  4: ['~এখন রাত ৪টা বাজে একটু পর ফজরের আযান দিলে নামাজ পড়ে নিও সবাই'],
  5: ['~এখন ভোর ৫টা বাজে সবাই নামাজ পড়ছো তো?❤️'],
  6: ['~এখন সকাল ৬টা বাজে ঘুম থেকে উঠো সবাই'],
  7: ['~এখন সকাল ৭টা বাজে সবাই ব্রেকফাস্ট করে নাও😊'],
  8: ['~এখন সকাল ৮ টা বাজে সবাই মনে হয় কাজে ব্যস্ত হয়ে গেছো'],
  9: ['~এখন সকাল ৯ টা বাজে মন দিয়ে কাজ করো সবাই❤️'],
  10: ['~এখন সকাল ১০টা বাজে মিস করছি তোমাদের'],
  11: ['~এখন সকাল ১১টা বাজে'],
  12: ['~এখন দুপুর ১২টা বাজে ❤️'],
  13: ['~এখন দুপুর ১টা বাজে সবাই কাজ বন্ধ করে জোহরের নামাজ পড়ে নাও😻'],
  14: ['~এখন দুপুর ২টা বাজে গোসল করে সবাই দুপুরের খাবার খেয়ে নাও ☺️'],
  15: ['~এখন দুপুর ৩টা বাজে❤️'],
  16: ['~ এখন বিকাল ৪টা বাজে আসরের আযান দিলে সবাই নামাজ পড়ে নাও🥀'],
  17: ['~এখন বিকাল ৫টা বাজে একটু পর মাগরিবের আযান দিবে সবাই নামাজ পড়ে নিও 😻'],
  18: ['~এখন সন্ধ্যা ৬টা বাজে সবাই হাতমুখ ধুয়ে কিছু খেয়ে নাও এবং পরিবারের সাথে সময় কাটাও😍.'],
  19: ['এখন সন্ধ্যা ৭ টা বাজে কি করছো সবাই এখন এশার আযান দিবে সবাই নামাজ পড়ে নাও❤️'],
  20: ['~এখন রাত ৮টা বাজে'],
  21: ['এখন রাত ৯টা বাজে সবাই কি শুয়ে পড়লা🙂'],
  22: ['~এখন রাত ১০টা বাজে সবাই ঘুমায় পড়ো আমার বউ নাই ভাই ঘুম ও আসে না😭'],
  23: ['~ এখন রাত ১১টা বাজে\nখাউয়া দাউয়া করে নেউ😙']
}

const channelCtx = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: config.newsletterJid,
    newsletterName: config.newsletterName,
    serverMessageId: 143
  }
}

const activeSockets = new Map()
const activeGroups = new Map() // botNum -> Set(groupJid)
let lastSentHourKey = ''

function getDhakaParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date())
  const get = t => Number(parts.find(p => p.type === t)?.value || 0)
  const hour = get('hour') % 24
  return {
    hour,
    minute: get('minute'),
    key: `${get('year')}-${get('month')}-${get('day')}-${hour}`
  }
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

setInterval(async () => {
  const { hour, minute, key } = getDhakaParts()
  if (minute !== 0 || key === lastSentHourKey) return
  const list = MESSAGES[hour]
  if (!list?.length) return
  lastSentHourKey = key

  const text = pick(list)
  for (const [botNum, sock] of activeSockets.entries()) {
    const groups = activeGroups.get(botNum)
    if (!groups?.size) continue
    for (const gid of groups) {
      if (!db.group(gid).autotime) continue
      await sock.sendMessage(gid, { text, contextInfo: channelCtx }).catch(() => {})
    }
  }
}, 15000).unref?.()

function registerChat(c) {
  if (c.botNum && c.sock) activeSockets.set(c.botNum, c.sock)
  if (c.isGroup && c.botNum) {
    if (!activeGroups.has(c.botNum)) activeGroups.set(c.botNum, new Set())
    activeGroups.get(c.botNum).add(c.from)
  }
}

export default {
  name: 'autotime',
  aliases: ['automsg'],
  category: 'admin',
  desc: 'Send automatic hourly Bangla messages in group',
  groupOnly: true,
  adminOnly: true,

  async run(c) {
    registerChat(c)
    const v = c.args[0]?.toLowerCase()
    if (v === 'on' || v === 'off') {
      c.group.autotime = v === 'on'
      c.db.save()
      return c.reply(`⏰ Auto hourly message is now *${v.toUpperCase()}* for this group.`)
    }
    if (v === 'test') {
      const { hour } = getDhakaParts()
      return c.reply(pick(MESSAGES[hour] || MESSAGES[0]))
    }
    await c.reply(`⏰ AutoTime is *${c.group.autotime ? 'ON' : 'OFF'}*\nUsage: ${c.prefix}autotime on | off | test`)
  },

  async auto(c) {
    registerChat(c)
    return false
  }
}
