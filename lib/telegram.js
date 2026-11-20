import TelegramBot from 'node-telegram-bot-api'
import { config } from './config.js'
import { startSession, hasSession } from './connect.js'
import { countryOf } from './utils.js'

export function startTelegram() {
  const token = config.telegramToken
  if (!token || !/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) {
    console.log('⚠️  Valid Telegram token not set (TELEGRAM_TOKEN / config.json) — /pair is disabled')
    return
  }

  const bot = new TelegramBot(token, { polling: true })

  bot.on('polling_error', e => {
    console.log('Telegram polling error:', e.message)
    if (String(e.message).includes('401')) {
      console.log('❌ Invalid/revoked Telegram token! Get a new token from @BotFather.')
      bot.stopPolling().catch(() => {})
    }
  })

  console.log('✈️  Telegram bot running')

  const buttons = () => {
    const rows = []
    if (config.waChannelLink) rows.push([{ text: 'WA Channel', url: config.waChannelLink }])
    if (config.telegramChannel) rows.push([{ text: 'Telegram Channel', url: config.telegramChannel }])
    return rows.length ? { inline_keyboard: rows } : undefined
  }

  bot.onText(/^\/start/, msg =>
    bot.sendMessage(
      msg.chat.id,
      '👋 Send /pair 8801XXXXXXXXX (country code, no +) to get your WhatsApp pairing code.',
      { reply_markup: buttons() }
    )
  )

  bot.onText(/^\/pair(?:@\w+)?\s*(.*)$/i, async (msg, match) => {
    const chatId = msg.chat.id
    const opts = { reply_to_message_id: msg.message_id }
    let num = (match[1] || '').replace(/\D/g, '')
    if (/^01\d{9}$/.test(num)) num = '88' + num

    if (num.length < 10 || num.length > 15) {
      return bot.sendMessage(chatId, 'Usage: /pair 8801XXXXXXXXX\n(with country code, without +)', opts)
    }

    if (hasSession(num)) {
      return bot.sendMessage(chatId, '✅ This number is already connected or being connected.', opts)
    }

    await bot.sendMessage(chatId, '⏳ Connecting, please wait 5-10 seconds...', opts)

    startSession(num, {
      onCode: async code => {
        const rawCode = String(code).replace(/[^A-Za-z0-9]/g, '')
        const htmlText =
          `🔑 <b>WhatsApp Pairing Code</b>\n\n` +
          `📱 <b>Number:</b> <code>+${num}</code>\n\n` +
          `<pre>${rawCode}</pre>\n` +
          `📌 <b>Code:</b> <code>${code}</code>\n\n` +
          `👆 <i>Tap the box above or the Copy button to copy your code!</i>\n\n` +
          `WhatsApp → Linked devices → Link a device → Link with phone number instead`

        try {
          await bot.sendMessage(chatId, htmlText, {
            ...opts,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: `📋 Copy Code (${code})`, copy_text: { text: rawCode } }]]
            }
          })
        } catch {
          await bot.sendMessage(chatId, htmlText, { ...opts, parse_mode: 'HTML' })
        }
      },
      onError: () => bot.sendMessage(chatId, '❌ Could not get a code, please try again.', opts),
      onOpen: () =>
        bot.sendMessage(
          chatId,
          `🤖 BOT CONNECTED!\n\n✅ Successfully linked!\n\n📱 Number: +${num}\n🌍 ${countryOf(num)}`,
          { ...opts, reply_markup: buttons() }
        )
    }).catch(e => bot.sendMessage(chatId, '❌ Error: ' + e.message, opts))
  })
}
