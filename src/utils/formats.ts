import moment from 'moment'

export const getBalanceString = (value: number, minF = 2, maxF = 2): string => {
  return !value || isNaN(value)
    ? '0'
    : value.toLocaleString('en-US', {
        minimumFractionDigits: minF,
        maximumFractionDigits: minF > maxF ? minF : maxF,
      })
}

export const ellipseAddress = (address = '', width = 5): string => {
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export const localeStringToNumber = (value: string): number => {
  if (!value) {
    return 0
  }
  return Number(value.replace(/,/g, ''))
}

export const roundingBalance = (balance = '0', separator = 6): string => {
  if (balance === '.') return '0.'

  const separateValue = balance.toString().split('.')

  let decimal = separateValue[1]
  if (decimal) {
    decimal = decimal.slice(0, separator)
  }

  return decimal ? [separateValue[0], decimal].join('.') : balance
}

export const formatDateOrTime = (dateString: string) => {
  // Convert the date string to a moment object
  const inputDate = moment(dateString)

  // Get the current date and time
  const now = moment()

  // Calculate the difference between the input date and the current date in milliseconds
  const timeDifference = inputDate.diff(now)

  // If the date is less than 24 hours away
  if (timeDifference > 0 && timeDifference < 24 * 60 * 60 * 1000) {
    // Return the date and time formatted as "DD-MM-YYYY HH:mm"
    return inputDate.format('DD-MM-YYYY HH:mm')
  } else {
    // Format the date as "DD-MM-YYYY"
    return inputDate.format('DD-MM-YYYY')
  }
}
