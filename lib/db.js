import fs from 'fs'
const FILE = 'db.json'
let data = { groups: {}, bots: {} }
try { data = { ...data, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) } } catch {}
data.groups ||= {}
data.bots ||= {}
let timer
function save() {
  clearTimeout(timer)
  timer = setTimeout(() => fs.writeFileSync(FILE, JSON.stringify(data, null, 2)), 500)
}
export const db = {
  group(id) {
    return data.groups[id] ||= { welcome: false, goodbye: false, antilink: false, adminEvents: true, autoreact: false, stats: {} }
  },
  // settings of one connected bot number (mode = public / private)
  bot(id) {
    return data.bots[id] ||= { mode: 'public' }
  },
  save
}
