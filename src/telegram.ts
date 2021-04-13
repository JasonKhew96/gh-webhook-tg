declare var BOT_TOKEN: any
declare var CHAT_ID: any

export function buildTelegramUrl(text: string): string {
  return `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&parse_mode=MarkdownV2&disable_web_page_preview=true&text=${encodeURIComponent(text)}`
}

export function markdownEscape(text: string): string {
  const escapeChar = [
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!',
  ]
  escapeChar.forEach((e) => {
    text = text.replaceAll(e, `\\${e}`)
  })
  return text
}

export function markdownUrlEscape(text: string): string {
  const escapeChar = [')', '\\']
  escapeChar.forEach((e) => {
    text = text.replaceAll(e, `\\${e}`)
  })
  return text
}
