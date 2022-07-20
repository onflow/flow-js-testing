export function isAddress(string) {
  return /^0x[0-9a-f]{16}$/.test(string)
}
