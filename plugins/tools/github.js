export default {
  name: 'github',
  aliases: ['gh'],
  category: 'tools',
  desc: 'Look up a GitHub user profile or repo',
  async run(c) {
    const q = c.args[0]
    if (!q) return c.reply(`Usage: ${c.prefix}github <username> or <owner/repo>`)
    const isRepo = q.includes('/')
    const res = await fetch(`https://api.github.com/${isRepo ? 'repos' : 'users'}/${q}`)
    if (!res.ok) return c.reply('❌ GitHub user/repo not found.')
    const d = await res.json()
    if (isRepo) {
      return c.reply(`🐙 *${d.full_name}*\n⭐ Stars: ${d.stargazers_count} | 🍴 Forks: ${d.forks_count}\n💻 Lang: ${d.language || 'N/A'}\n📝 ${d.description || 'No description'}\n🔗 ${d.html_url}`)
    }
    await c.sock.sendMessage(c.from, {
      image: { url: d.avatar_url },
      caption: `🐙 *${d.name || d.login}* (@${d.login})\n📦 Repos: ${d.public_repos} | 👥 Followers: ${d.followers}\n📝 ${d.bio || 'No bio'}\n🔗 ${d.html_url}`,
      contextInfo: c.channelCtx
    }, { quoted: c.quote })
  }
}
