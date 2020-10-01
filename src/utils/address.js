export const sansPrefix = (address) => {
  if (address == null) return null
  return address.replace(/^0x/, "")
}

export const withPrefix = (address) => {
  if (address == null) return null
  return "0x" + sansPrefix(address)
}
