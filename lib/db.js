import fs from 'fs'
const FILE = 'db.json'
let data = { groups: {} }
try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch {}
let timer
function save() {
  clearTimeout(timer)
  timer = setTimeout(() => fs.writeFileSync(FILE, JSON.stringify(data, null, 2)), 500)
}
export const db = {
  group(id) {
    return data.groups[id] ||= { welcome: false, goodbye: false, antilink: false, adminEvents: true }
  },
  save
}
