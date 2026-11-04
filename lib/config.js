import fs from 'fs'
export const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf8'))
