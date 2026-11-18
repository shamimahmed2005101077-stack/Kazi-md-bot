export default {
  name: 'mediafire',
  aliases: ['mf'],
  category: 'downloader',
  desc: 'Download file from MediaFire link',
  async run(c) {
    const url = c.args[0]
    if (!url || !/mediafire\.com/i.test(url)) return c.reply(`Usage: ${c.prefix}mediafire <mediafire_url>`)
    await c.reply('⏳ Resolving MediaFire file...')
    const html = await (await fetch(url)).text()
    const dlMatch = html.match(/href="(https:\/\/download[^"]+)"/i)
    const nameMatch = html.match(/class="dl-btn-label"[^>]*title="([^"]+)"/i) || html.match(/<div class="filename">([^<]+)<\/div>/i)
    if (!dlMatch) return c.reply('❌ Direct download link not found.')
    const fileName = (nameMatch?.[1] || 'mediafire-file').trim()
    await c.sock.sendMessage(c.from, { document: { url: dlMatch[1] }, fileName, mimetype: 'application/octet-stream', contextInfo: c.channelCtx }, { quoted: c.quote })
  }
}
