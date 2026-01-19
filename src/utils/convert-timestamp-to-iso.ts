export const convertTimestampToISO = (value: number | string): string => {
  if (typeof value === 'number') {
    const date = new Date(value * 1000)
    return date.toISOString()
  } else {
    return value
  }
}
