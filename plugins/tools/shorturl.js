export default {
  name: 'shorturl',
  aliases: ['short'],
  category: 'tools',
  desc: 'Shorten a URL using TinyURL',
  async run(c) {
    const url = c.args[0]
    if (!url || !/^https?:\/\//i.test(url)) return c.reply(`Usage: ${c.prefix}shorturl https://example.com`)
    const short = await (await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)).text()
    await c.reply(`🔗 *Short URL:*\n${short}`)
  }
}
