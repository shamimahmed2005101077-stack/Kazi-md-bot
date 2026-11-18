export default {
  name: 'time',
  category: 'tools',
  desc: 'Show current time (default: Asia/Dhaka)',
  async run(c) {
    const tz = c.text || 'Asia/Dhaka'
    try {
      const now = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, dateStyle: 'full', timeStyle: 'medium', hour12: true
      }).format(new Date())
      await c.reply(`⏰ *Time (${tz}):*\n${now}`)
    } catch {
      await c.reply(`❌ Invalid timezone. Example: ${c.prefix}time Asia/Dhaka or Europe/London`)
    }
  }
}
