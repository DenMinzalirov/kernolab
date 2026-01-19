import { validate } from 'bitcoin-address-validation'
import { isAddress } from 'ethers'

import { getUnstoppabledomainsAddress } from 'wip/services'

// TODO: need check libs
const checkList = ['XRP', 'TRX', 'DOGE', 'NEAR', 'DOT', 'XTZ', 'ADA', 'SOL', 'ATOM', 'EOS', 'KSM', 'TON', 'XLM', 'LTC']
const EVMList = ['ETH', 'BNB', 'AVAX', 'MATIC', 'GLMR', 'LINK', 'BSC']

export const validateAddress = async (value: string, network: string): Promise<string> => {
  try {
    // console.log(value, network)
    // TODO: UnstoppableDomains
    // if (value.includes('.')) {
    //   const { records } = await getUnstoppabledomainsAddress(value)
    //   const unstoppableKey = Object.keys(records).find(record => record.includes(network.replace('BSC', 'BNB')))
    //   return unstoppableKey ? records[unstoppableKey] : ''
    // }

    if (EVMList.includes(network)) {
      return isAddress(value) ? value : ''
    }

    if (checkList.includes(network)) {
      const regexes: Record<string, RegExp> = {
        ADA: /^(Ae2|DdzFF|addr1|stake1)/,
        ATOM: /^cosmos1[ac-hj-np-z02-9]{38}$/,
        DOGE: /^(D|A)[a-zA-Z0-9]{32,34}$/,
        DOT: /^1[a-km-zA-HJ-NP-Z1-9]{46,48}$/,
        EOS: /^[a-z1-5.]{12}$/,
        TRX: /^T[a-zA-Z0-9]{33}$/,
        KSM: /^C[a-zA-HJ-NP-Z0-9]{46}$/,
        NEAR: /^([a-zA-Z0-9_-]+\.near|[a-fA-F0-9]{64})$/,
        SOL: /^[1-9A-HJ-NP-Za-km-z]{44}$/,
        TON: /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/,
        XLM: /^G[A-Z2-7]{55}$/,
        XRP: /^r[1-9A-HJ-NP-Za-km-z]{25,33}$/,
        XTZ: /^tz[1-3][a-zA-Z0-9]{33}$/,
        LTC: /^(L|3|M)[A-Za-z0-9]{33}$|^ltc1([a-z0-9]{39,59})$/,
      }

      return regexes[network].test(value) ? value : ''
    }

    if (network === 'BTC') {
      return validate(value) ? value : ''
    }

    return value
  } catch (error) {
    console.log('validateAddress-ERROR', error)
    return ''
  }
}
