import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Copied } from 'components'
import copyWhite from 'assets/icons/copy-white.svg'

import { $unstoppableDomains } from '../../../model/unstoppableDomains'
import styles from './styles.module.scss'

//TODO Deprecate?
export function ListUDModal() {
  const unstoppableDomains = useUnit($unstoppableDomains)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(unstoppableDomains?.meta.domain ?? '')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <>
      <div className={styles.title}>Your WEB3 Domain</div>
      <div className={styles.contentWrap}>
        <div onClick={handleCopy} className={styles.unstoppable}>
          {unstoppableDomains?.meta.domain}
          <img className={styles.copyWhiteIcon} alt='' src={copyWhite} />
        </div>
        <div className={styles.supportedTitle}>Supported Networks</div>
        <div style={{ flexGrow: 1 }}>
          <div className={styles.resultList}>
            {Object.entries(unstoppableDomains?.records ?? {}).map(item => {
              const networkName = (item[0] ?? '')
                .replace('crypto.', '')
                .replace('.address', '')
                .replace('.version.', ' ')
                .replace('BNB', 'BSC')

              if (networkName.includes('ipfs.html.value')) return null
              return (
                <div key={item[0]} className={styles.resultItem}>
                  <div style={{ fontFamily: 'Lexend', fontWeight: 600, minWidth: '30%' }}>Address {networkName}</div>
                  {/*@ts-ignore*/}
                  <div>{item[1]}</div>
                </div>
              )
            })}
          </div>
        </div>
        <button onClick={handleCopy} className={clsx('btn', 'btn-primary', styles.copyBtn)}>
          Copy WEB3 Domain
        </button>
        {isCopied ? <Copied /> : <div style={{ height: 102 }} />}
      </div>
    </>
  )
}
