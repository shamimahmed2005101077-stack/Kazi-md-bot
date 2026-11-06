import { sendMusic } from '../../lib/yt.js'
export default {
  name: 'play', category: 'music', desc: 'Play a song as an audio message',
  async run(c) { await sendMusic(c, { asFile: false, usage: 'play' }) }
}
