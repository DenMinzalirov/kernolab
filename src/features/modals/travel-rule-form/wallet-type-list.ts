import { CustodialProvider, WalletType } from 'wip/services/crypto-travel-rules'

import binance from './assets/binance-icon.svg'
import coinbase from './assets/coinbase-icon.svg'
import cryptocom from './assets/crypto-com-icon.svg'
import ftx from './assets/ftx-icon.svg'
import gateio from './assets/gate-io-icon.svg'
import gemini from './assets/gemini-icon.svg'
import huobi from './assets/huobi-icon.svg'
import kraken from './assets/kraken-icon.svg'
import kucoin from './assets/kucoin-icon.svg'
import okx from './assets/okx-icon.svg'

export const walletTypeList = [
  { name: 'Non-Custodial Wallet', value: WalletType.NON_CUSTODIAL, icon: '' },
  { name: 'Crypto.com', value: CustodialProvider.CRYPTO_COM, icon: cryptocom },
  { name: 'Binance', value: CustodialProvider.BINANCE, icon: binance },
  { name: 'Kraken', value: CustodialProvider.KRAKEN, icon: kraken },
  { name: 'Coinbase', value: CustodialProvider.COINBASE, icon: coinbase },
  { name: 'FTX', value: CustodialProvider.FTX, icon: ftx },
  { name: 'Huobi', value: CustodialProvider.HUOBI, icon: huobi },
  { name: 'OKX', value: CustodialProvider.OKX, icon: okx },
  { name: 'Gemini', value: CustodialProvider.GEMINI, icon: gemini },
  { name: 'KuCoin', value: CustodialProvider.KUCOIN, icon: kucoin },
  { name: 'Gate.io', value: CustodialProvider.GATE_IO, icon: gateio },
  { name: 'Other', value: WalletType.OTHER, icon: '' },
]
