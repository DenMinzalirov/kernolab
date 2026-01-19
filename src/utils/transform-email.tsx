export const transformEmail = (email: string) => {
  if (!email) return '--'

  const namePart = email.split('@')[0]
  const firstChar = namePart[0]

  const dotIndex = namePart.indexOf('.')
  const secondChar = dotIndex !== -1 ? namePart[dotIndex + 1] : namePart[1]

  return firstChar + secondChar || '--'
}
