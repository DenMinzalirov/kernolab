import {
  CardOrderInfoModal,
  ChangePasswordModal,
  DepositAssetModal,
  DepositBankingModal,
  GetUDModal,
  IndividualEarnModal,
  ListUDModal,
  LockBbankModal,
  TradeAssetModal,
  TwoFaSetup,
  WithdrawAssetModal,
  WithdrawBankingModal,
} from 'features/modals'

export const MODAL_TYPES = {
  INDIVIDUAL_EARN_MODAL: 'individual-earn',
  LOCK_BBANK_MODAL: 'lock-BBANK',
  NEW_EARNING_MODAL: 'new-earning',
  TWO_FACTOR_AUTHENTICATION_MODAL: 'two-factor-authentication',
  WITHDRAW_ASSET: 'withdraw-asset',
  DEPOSIT_ASSET: 'deposit-asset',
  TRADE_ASSET: 'trade-asset',
  LIST_UD_MODAL: 'list-UD',
  GET_UD_MODAL: 'get-UD',
  TOP_UP_BANKING: 'top-up-banking',
  WITHDRAW_BANKING: 'withdraw-banking',
  TRANSACTIONS_MODAL: 'transactions',
  CHANGE_PASSWORD_MODAL: 'change-password',
  CARD_ORDER_INFO_MODAL: 'card-order-info',
} as const

export const MODAL_COMPONENTS = {
  [MODAL_TYPES.INDIVIDUAL_EARN_MODAL]: IndividualEarnModal,
  [MODAL_TYPES.LOCK_BBANK_MODAL]: LockBbankModal,
  // [MODAL_TYPES.NEW_EARNING_MODAL]: NewEarningModal,
  [MODAL_TYPES.TWO_FACTOR_AUTHENTICATION_MODAL]: TwoFaSetup,
  [MODAL_TYPES.LIST_UD_MODAL]: ListUDModal,
  [MODAL_TYPES.GET_UD_MODAL]: GetUDModal,
  [MODAL_TYPES.CHANGE_PASSWORD_MODAL]: ChangePasswordModal,
  [MODAL_TYPES.DEPOSIT_ASSET]: DepositAssetModal,
  [MODAL_TYPES.WITHDRAW_ASSET]: WithdrawAssetModal,
  [MODAL_TYPES.CARD_ORDER_INFO_MODAL]: CardOrderInfoModal,
  [MODAL_TYPES.TRADE_ASSET]: TradeAssetModal, // right
  [MODAL_TYPES.TOP_UP_BANKING]: DepositBankingModal, // right
  [MODAL_TYPES.WITHDRAW_BANKING]: WithdrawBankingModal, // right
}

export const RightModals = ['trade-asset', 'top-up-banking', 'withdraw-banking', 'transactions']
