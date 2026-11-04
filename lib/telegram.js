import TelegramBot from 'node-telegram-bot-api'
import { config } from './config.js'
import { startSession, hasSession } from './connect.js'
import { countryOf } from './utils.js'

export function startTelegram() {
  const token = config.telegramToken
  if (!token || !/^\d+:/.test(token)) {
    console.log('⚠️  Telegram token not set in config.json — /pair is disabled')
    return
  }
  const bot = new TelegramBot(token, { polling: true })
  bot.on('polling_error', e => console.log('Telegram polling error:', e.message))
  console.log('✈️  Telegram bot running')

  const buttons = () => {
    const rows = []
    if (config.waChannelLink) rows.push([{ text: 'WA Channel', url: config.waChannelLink }])
    if (config.telegramChannel) rows.push([{ text: 'Telegram Channel', url: config.telegramChannel }])
    return rows.length ? { inline_keyboard: rows } : undefined
  }

  bot.onText(/^\/start/, msg => bot.sendMessage(msg.chat.id,
    '👋 Send /pair 8801XXXXXXXXX (country code, no +) to get your WhatsApp pairing code.',
    { reply_markup: buttons() }))

  bot.onText(/^\/pair(?:@\w+)?\s*(.*)$/i, async (msg, match) => {
    const chatId = msg.chat.id
    const opts = { reply_to_message_id: msg.message_id }
    let num = (match[1] || '').replace(/\D/g, '')
    if (/^01\d{9}$/.test(num)) num = '88' + num   // 01XXXXXXXXX -> 8801XXXXXXXXX (Bangladesh)
    if (num.length < 10 || num.length > 15)
      return bot.sendMessage(chatId, 'Usage: /pair 8801XXXXXXXXX\n(with country code, without +)', opts)
    if (hasSession(num))
      return bot.sendMessage(chatId, '✅ This number is already connected or being connected.', opts)

    await bot.sendMessage(chatId, '⏳ Connecting, please wait 5-10 seconds...', opts)
    startSession(num, {
      onCode: code => bot.sendMessage(chatId,
        `🔑 Your pairing code: ${code}\n\nWhatsApp → Linked devices → Link with phone number → enter this code.`, opts),
      onError: () => bot.sendMessage(chatId, '❌ Could not get a code, please try again.', opts),
      onOpen: () => bot.sendMessage(chatId,
        `🤖 BOT CONNECTED!\n\n✅ Successfully linked!\n\n📱 Number: +${num}\n🌍 ${countryOf(num)}`,
        { ...opts, reply_markup: buttons() })
    }).catch(e => bot.sendMessage(chatId, '❌ Error: ' + e.message, opts))
  })
}
