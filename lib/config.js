import fs from 'fs'

const raw = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf8'))

export const config = {
  ...raw,
  telegramToken: (process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN || raw.telegramToken || '').trim(),
  geminiKey: (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || raw.geminiKey || '').trim()
}
