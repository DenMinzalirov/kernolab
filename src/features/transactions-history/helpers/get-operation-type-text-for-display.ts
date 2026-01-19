//TODO понять какие type будут использоваться
//CRYPTO_DEPOSIT, FIAT_DEPOSIT, CRYPTO_WITHDRAW, FIAT_WITHDRAW
export const getOperationTypeTextForDisplay = (type: string) => {
  switch (type) {
    case 'CRYPTO_DEPOSIT':
      return 'Receive Crypto'
    case 'STAKING_REWARD':
      return 'Staking Reward'
    case 'FIAT_DEPOSIT':
      return 'Receive Fiat'
    case 'CRYPTO_WITHDRAW':
      return 'Send Crypto'
    case 'FIAT_WITHDRAW':
      return 'Send Fiat'
    case 'EXCHANGE':
      return 'Exchange'
    case 'OTC_REFUND':
      return 'OTC Refund'
    case 'OTC_DEPOSIT':
      return 'OTC Deposit'
    case 'OTC_EXCHANGE':
      return 'OTC Exchange'
    case 'LAUNCHPAD_CLAIM_REFUND':
      return 'Refund Claim'

    default:
      return type
  }
}
