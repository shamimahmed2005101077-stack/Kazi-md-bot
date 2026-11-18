export default {
  name: 'fetch',
  category: 'tools',
  desc: 'Fetch raw JSON/text/header preview from a URL',
  ownerOnly: true,
  async run(c) {
    const url = c.args[0]
    if (!url || !/^https?:\/\//i.test(url)) return c.reply(`Usage: ${c.prefix}fetch https://api.github.com`)
    const res = await fetch(url)
    const ct = res.headers.get('content-type') || 'unknown'
    const text = (await res.text()).slice(0, 1500)
    await c.reply(`🌐 *HTTP ${res.status}* (${ct})\n\n\`\`\`\n${text}\n\`\`\``)
  }
}
