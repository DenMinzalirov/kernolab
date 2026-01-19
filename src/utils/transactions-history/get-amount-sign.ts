import { MINUS_SIGN_TITLES, PLUS_SIGN_TITLES } from 'features/transactions-history/constants'

export const getAmountSign = (title: string) => {
  if (PLUS_SIGN_TITLES.includes(title)) {
    return '+'
  }
  if (MINUS_SIGN_TITLES.includes(title)) {
    return '-'
  }
  return ''
}
