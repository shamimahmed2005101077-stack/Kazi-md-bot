export const sleep = ms => new Promise(r => setTimeout(r, ms))

export function fmtUptime(sec) {
  sec = Math.floor(sec)
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600)
  const m = Math.floor(sec % 3600 / 60), s = sec % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

const CODES = {
  '880': 'Bangladesh', '91': 'India', '92': 'Pakistan', '966': 'Saudi Arabia', '971': 'UAE',
  '965': 'Kuwait', '974': 'Qatar', '968': 'Oman', '973': 'Bahrain', '60': 'Malaysia',
  '65': 'Singapore', '44': 'United Kingdom', '1': 'USA / Canada', '977': 'Nepal',
  '94': 'Sri Lanka', '20': 'Egypt', '62': 'Indonesia', '90': 'Turkey', '61': 'Australia',
  '49': 'Germany', '33': 'France', '39': 'Italy', '34': 'Spain', '7': 'Russia', '81': 'Japan'
}
export function countryOf(num) {
  for (let l = 3; l >= 1; l--) {
    const c = CODES[num.slice(0, l)]
    if (c) return `${c} (+${num.slice(0, l)})`
  }
  return 'Unknown'
}
