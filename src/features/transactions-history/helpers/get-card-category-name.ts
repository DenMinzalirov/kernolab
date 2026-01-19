import { codeToGroupMapping } from 'features/modals/transaction-filter/category-mapping'
import { AccountStatementRecord } from 'wip/services'

const categoryIcons: { [key: string]: string } = {
  '1': 'Health',
  '2': 'Utilities',
  '3': 'Travel',
  '4': 'Transport',
  '5': 'Travel',
  '6': 'Transport',
  '7': 'Services',
  '8': 'Utilities',
  '9': 'Groceries',
  '10': 'Transport',
  '11': 'Shopping',
  '12': 'Entertainment',
  '13': 'Restaurants',
  '14': 'Shopping',
  '15': 'Shopping',
  '16': 'Entertainment',
  '17': 'Services',
  '18': 'Services',
  '999': 'Other',
  'Group Withdraw': 'Withdrawal',
  'Group Deposit': 'Deposit',
}

export const getCardCategoryName = (data: AccountStatementRecord) => {
  if (data.group === 'WITHDRAW') {
    return categoryIcons['Group Withdraw']
  } else if (data.group === 'DEPOSIT') {
    return categoryIcons['Group Deposit']
  } else if (data.group?.includes('FEE')) {
    return categoryIcons['Group Withdraw']
  } else if (data.merchantCategoryCode === null) {
    return categoryIcons['999']
  } else {
    const code = data.merchantCategoryCode
    const cleanCode = code ? (code.startsWith('_') ? code.slice(1) : code) : ''
    const group = codeToGroupMapping[cleanCode]

    return (group && categoryIcons[group]) || categoryIcons['999']
  }
}
