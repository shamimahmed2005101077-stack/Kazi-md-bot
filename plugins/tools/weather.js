export default {
  name: 'weather',
  category: 'tools',
  desc: 'Check live weather for any city',
  async run(c) {
    if (!c.text) return c.reply(`Usage: ${c.prefix}weather <city>`)
    const res = await fetch(`https://wttr.in/${encodeURIComponent(c.text)}?format=j1`)
    if (!res.ok) return c.reply('❌ City not found.')
    const data = await res.json()
    const cur = data.current_condition?.[0]
    const area = data.nearest_area?.[0]
    await c.reply(
      `🌦️ *Weather: ${area?.areaName?.[0]?.value || c.text}, ${area?.country?.[0]?.value || ''}*\n` +
      `• *Condition:* ${cur?.weatherDesc?.[0]?.value}\n` +
      `• *Temp:* ${cur?.temp_C}°C (Feels ${cur?.FeelsLikeC}°C)\n` +
      `• *Humidity:* ${cur?.humidity}%\n• *Wind:* ${cur?.windspeedKmph} km/h`
    )
  }
}
