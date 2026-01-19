export function getBlockchainExplorerUrl(networkId: string, blockchainHash: string): string {
  const baseUrls: { [key: string]: string } = {
    ETH: 'https://etherscan.io/tx/',
    TRX: 'https://tronscan.org/#/transaction/',
    AVAX: 'https://snowtrace.io/tx/',
    BSC: 'https://bscscan.com/tx/',
    BTC: 'https://www.blockchain.com/btc/tx/',
    LTC: 'https://blockchair.com/litecoin/transaction/',
    DOGE: 'https://dogechain.info/tx/',
    MATIC: 'https://polygonscan.com/tx/',
    XRP: 'https://xrpscan.com/tx/',
    NEAR: 'https://explorer.near.org/transactions/',
    DOT: 'https://polkascan.io/polkadot/transaction/',
    XTZ: 'https://tzkt.io/',
    ADA: 'https://cardanoscan.io/transaction/',
    SOL: 'https://solscan.io/tx/',
    TON: 'https://tonscan.org/tx/',
    XLM: 'https://stellarchain.io/tx/',

    FTM: 'https://ftmscan.com/tx/', // Fantom
    ALGO: 'https://algoexplorer.io/tx/', // Algorand
    EOS: 'https://bloks.io/transaction/', // EOS
    ZIL: 'https://viewblock.io/zilliqa/tx/', // Zilliqa
    VET: 'https://explore.vechain.org/transactions/', // VeChain
    HBAR: 'https://hashscan.io/#/mainnet/transaction/', // Hedera Hashgraph
    ATOM: 'https://www.mintscan.io/cosmos/txs/', // Cosmos
    KSM: 'https://polkascan.io/kusama/transaction/', // Kusama
    FLOW: 'https://flowscan.org/transaction/', // Flow
    ICX: 'https://tracker.icon.foundation/transaction/', // ICON
    EGLD: 'https://explorer.elrond.com/transactions/', // Elrond
    HNT: 'https://explorer.helium.com/txns/', // Helium
    RUNE: 'https://viewblock.io/thorchain/tx/', // Thorchain
    ARB: 'https://arbiscan.io/tx/', // Arbitrum
    OP: 'https://optimistic.etherscan.io/tx/', // Optimism
    APT: 'https://explorer.aptoslabs.com/txn/', // Aptos
    SUI: 'https://explorer.sui.io/transactions/', // Sui
    CELO: 'https://explorer.celo.org/tx/', // Celo
    KLAY: 'https://scope.klaytn.com/tx/', // Klaytn
    MOON: 'https://moonbeam.moonscan.io/tx/', // Moonbeam
    RSK: 'https://explorer.rsk.co/tx/', // RSK
    AVA: 'https://avascan.info/blockchain/avax/tx/', // Avalanche (C-Chain Alternative)
  }

  const baseUrl = baseUrls[networkId]

  if (!baseUrl) {
    return ''
  }

  return `${baseUrl}${blockchainHash}`
}
