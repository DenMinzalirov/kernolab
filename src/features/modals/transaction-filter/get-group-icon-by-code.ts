import { AccountStatementRecord } from 'wip/services'
import depositIconSvg from 'assets/icons/history/deposit-icon.svg'
import withdrawalIconSvg from 'assets/icons/history/withdrawal-icon.svg'
import entertainmentIconSvg from 'assets/icons/history-card/entertainment-icon.svg'
import groceriesIconSvg from 'assets/icons/history-card/groceries-icon.svg'
import healthIconSvg from 'assets/icons/history-card/health-icon.svg'
import otherIconSvg from 'assets/icons/history-card/other-icon.svg'
import restaurantsIconSvg from 'assets/icons/history-card/restaurants-icon.svg'
import servicesIconSvg from 'assets/icons/history-card/services-icon.svg'
import shoppingIconSvg from 'assets/icons/history-card/shopping-icon.svg'
import transportIconSvg from 'assets/icons/history-card/transport-icon.svg'
import travelIconSvg from 'assets/icons/history-card/travel-icon.svg'
import utilitiesIconSvg from 'assets/icons/history-card/utilities-icon.svg'

import { codeToGroupMapping } from './category-mapping'

const categoryIcons: { [key: string]: string } = {
  '1': healthIconSvg,
  '2': utilitiesIconSvg,
  '3': travelIconSvg,
  '4': transportIconSvg,
  '5': travelIconSvg,
  '6': transportIconSvg,
  '7': servicesIconSvg,
  '8': utilitiesIconSvg,
  '9': groceriesIconSvg,
  '10': transportIconSvg,
  '11': shoppingIconSvg,
  '12': entertainmentIconSvg,
  '13': restaurantsIconSvg,
  '14': shoppingIconSvg,
  '15': shoppingIconSvg,
  '16': entertainmentIconSvg,
  '17': servicesIconSvg,
  '18': servicesIconSvg,
  '999': otherIconSvg,
  'Group Withdraw': withdrawalIconSvg,
  'Group Deposit': depositIconSvg,
}

export const getGroupIconForTxnHistory = (data: AccountStatementRecord) => {
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
