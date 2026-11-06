import { sendMusic } from '../../lib/yt.js'
export default {
  name: 'song', aliases: ['mp3'], category: 'music', desc: 'Download a song as an audio file',
  async run(c) { await sendMusic(c, { asFile: true, usage: 'song' }) }
}
