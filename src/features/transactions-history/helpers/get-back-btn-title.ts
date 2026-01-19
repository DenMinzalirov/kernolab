import { TYPE_TXN_HISTORY } from '../constants'

export const getBackBtnTitle = (txnType: string) => {
  if (TYPE_TXN_HISTORY.CRYPTO === txnType) {
    return 'Portfolio'
  } else if (TYPE_TXN_HISTORY.STAKING === txnType) {
    return 'Earn'
  } else if (TYPE_TXN_HISTORY.CARD === txnType) {
    return 'Card'
  } else {
    return 'Main'
  }
}
