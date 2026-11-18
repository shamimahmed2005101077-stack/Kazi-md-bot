import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export default {
  name: 'attp',
  category: 'maker',
  desc: 'Create colorful animated text sticker',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}attp <text>`)
    const txt = c.text.slice(0, 60).replace(/[':]/g, '')
    const out = path.join(os.tmpdir(), `attp_${Date.now()}.webp`)
    try {
      await exec('ffmpeg', [
        '-y', '-f', 'lavfi', '-i', 'color=c=black@0.0:s=512x512:d=2,format=rgba',
        '-vf', `drawtext=text='${txt}':fontcolor=cyan:fontsize=60:borderw=4:bordercolor=purple:x=(w-text_w)/2:y=(h-text_h)/2,hue=h=360*t/2`,
        '-vcodec', 'libwebp', '-loop', '0', out
      ])
      await c.sock.sendMessage(c.from, { sticker: fs.readFileSync(out), contextInfo: c.channelCtx }, { quoted: c.quote })
    } finally {
      fs.rmSync(out, { force: true })
    }
  }
}
