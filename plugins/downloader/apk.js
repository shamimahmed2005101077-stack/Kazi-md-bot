export default {
  name: 'apk',
  category: 'downloader',
  desc: 'Search & download Android APK (Aptoide)',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}apk <app name>`)
    await c.reply(`🔍 Searching APK for *${c.text}*...`)
    const res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(c.text)}&limit=1`)
    const data = await res.json().catch(() => null)
    const app = data?.datalist?.list?.[0]
    if (!app?.file?.path) return c.reply('❌ APK not found.')
    const sizeMb = (app.file.filesize / (1024 * 1024)).toFixed(2)
    if (Number(sizeMb) > 95) return c.reply(`⚠️ *${app.name}* is ${sizeMb} MB (too large for WhatsApp).\n🔗 Link: ${app.file.path}`)
    await c.sock.sendMessage(c.from, {
      document: { url: app.file.path },
      fileName: `${app.package || app.name}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      caption: `📦 *${app.name}* v${app.file.vername} (${sizeMb} MB)`,
      contextInfo: c.channelCtx
    }, { quoted: c.quote })
  }
}
