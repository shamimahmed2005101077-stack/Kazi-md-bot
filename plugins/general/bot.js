const BOSS = 'Shamim Ahmed'
const pick = a => a[Math.floor(Math.random() * a.length)]

// Random replies when someone starts a message with "bot"
const lines = [
  'বেশি bot Bot করলে leave নিবো কিন্তু😒😒', 'শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নাই🥺 পচা তুমি🥺',
  'আমি আবাল দের সাথে কথা বলি না, ok😒', 'এতো ডেকো না, প্রেম এ পরে যাবো তো🙈',
  'Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈💋', 'বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑',
  'হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?', 'এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬',
  'I love you janu🥰', 'আরে Bolo আমার জান, কেমন আছো?😚', 'Bot বলে অসম্মান করছি,😰😿',
  'Hop beda😾, Boss বল boss😼', 'চুপ থাক, নাই তো তোর দাত ভেঙ্গে দিবো কিন্তু', 'Bot না, জানু বল জানু 😘',
  'বার বার Disturb করছিস কেনো😾, আমার জানুর সাথে ব্যাস্ত আছি😋', 'দূরে যা তুই ৭দিন ধরে গোসল করছ না😷',
  'আমাকে ডাকলে, আমি কিন্তু কিস করে দিবো😘', 'আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒',
  'হ্যাঁ জানু, এইদিক এ আসো কিস দেই🤭😘', 'দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣',
  'তোর কথা তোর বাড়ি কেউ শুনে না, তো আমি কেনো শুনবো?🤔😂', 'আমাকে ডেকো না, আমি ব্যাস্ত আছি',
  'কি হলো, মিস্টেক করচ্ছিস নাকি🤣', 'বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏', 'কালকে দেখা করিস তো একটু 😈',
  'হা বলো, শুনছি আমি 😏', 'আর কত বার ডাকবি, শুনছি তো', 'হুম বলো কি বলবে😒', 'বলো কি করতে পারি তোমার জন্য',
  'আমি তো অন্ধ কিছু দেখি না🐸😎', 'Bot না জানু, বল 😌', 'বলো জানু 🌚', 'তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒',
  'জান তোমার একটা পিক দেও স্টোরিতে দিমু😑😘', 'তুমিও আমাকে সবার মতন bot বলে ডাকো😞 jan বলে ডাকবা😒😙',
  'হুম জান তোমার অইখানে উম্মমাহ😷😘', 'আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰',
  `আমাকে এতো না ডেকে বস ${BOSS} কে একটা Gf দে 🙄`,
  `যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস ${BOSS} এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗`,
  'আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈'
]

const lastUse = new Map()

export default {
  name: 'bot', category: 'general', desc: 'Chat with the bot (.bot on/off in a group)',
  async run(c) {
    const v = c.args[0]?.toLowerCase()
    if (v === 'on' || v === 'off') {
      if (!c.isGroup) return c.reply('This switch works in groups only.')
      if (!(c.isAdmin || c.isOwner)) return c.reply('❌ Only group admins can change this.')
      c.group.chatbot = v === 'on'; c.db.save()
      return c.reply(`✅ Auto chat is now *${v.toUpperCase()}* in this group.\n(The bot only answers when a message starts with the word bot.)`)
    }
    await c.reply(`${c.m.pushName || 'User'}, ${pick(lines)}`)
  },

  // Runs on normal messages (no prefix needed)
  // Replies ONLY when a message starts with "bot" or "বট" (example: "bot ki khobor").
  // Never in private chats, never to your own messages, nothing else triggers it.
  async auto(c) {
    if (c.m.key.fromMe) return false
    if (!c.isGroup || c.group?.chatbot === false) return false
    const body = (c.body || '').trim()
    if (!/^(bot|বট)(\s|$|[.,!?])/i.test(body)) return false

    const now = Date.now()
    if (now - (lastUse.get(c.sender) || 0) < 5000) return false   // 5 sec cooldown per person
    lastUse.set(c.sender, now)

    await c.reply(`${c.m.pushName || 'User'}, ${pick(lines)}`)
    return true
  }
}
