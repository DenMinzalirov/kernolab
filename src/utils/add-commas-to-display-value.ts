/* Adds commas to the string representing a number before the decimal point. */

export const addCommasToDisplayValue = (inputString: string | undefined, fractionLength = 18) => {
  if (!inputString) return ''

  const parts = inputString.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Check if there is a decimal part and if the number of decimal places is specified
  if (parts.length > 1 && fractionLength !== undefined) {
    parts[1] = parts[1].substring(0, fractionLength)
    if (+parts[1]) {
      parts[1] = parts[1].replace(/0+$/, '')
    }
  }

  if (fractionLength === 0) {
    return parts[0]
  }

  return parts.join('.')
}
