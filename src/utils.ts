export function trimBody(text: string): string {
  if (text.length > 2048) {
    return text.substring(0, 2048) + '...'
  }
  return text
}
