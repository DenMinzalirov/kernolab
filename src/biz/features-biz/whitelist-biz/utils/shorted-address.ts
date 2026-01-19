export const shortedAddress = (address: string, visibleChars: number = 6): string => {
  if (visibleChars === 0 || address.length <= visibleChars * 2) return address
  return `${address.slice(0, visibleChars)}...${address.slice(-visibleChars)}`
}
