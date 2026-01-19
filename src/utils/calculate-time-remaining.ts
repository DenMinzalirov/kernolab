export const calculateTimeRemaining = (expirationDateString: string) => {
  const expirationDate = new Date(expirationDateString)
  const now = new Date()
  return Math.max(Math.floor((expirationDate.getTime() - now.getTime()) / 1000), 0)
}
