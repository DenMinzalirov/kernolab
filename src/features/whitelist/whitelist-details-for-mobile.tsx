import { useState } from 'react'

import { Modal } from 'components'
import { CopyComponent } from 'components/copy-component'
import { WhitelistAddressResponse } from 'wip/services/white-list'

import styles from './styles.module.scss'

type Props = {
  data: WhitelistAddressResponse
  action: () => void
}

export const WhitelistDetailsForMobile = ({ data, action }: Props) => {
  const [isCopied, setIsCopied] = useState('')

  return (
    <>
      <div className={styles.modalDetailsContainer}>
        <div className={styles.modalDetailsContentWrap}>
          <div className={styles.modalDetailsTitle}>Whitelist Details</div>
          <div className={styles.modalDetailsContent}>
            <div className={styles.modalDetailsName}>{data?.name}</div>
            <div className={styles.modalDetailsRowWrap}>
              <div className={styles.modalDetailsRow}>
                <div className={styles.modalDetailsRowText}>Address:</div>
                <div className={styles.modalDetailsRowSubTextWrap}>
                  <div className={styles.modalDetailsRowSubText}>{data.address}</div>
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(data.address).then(() => {
                        setIsCopied(data.address)
                        setTimeout(() => {
                          setIsCopied('')
                        }, 2000)
                      })
                    }}
                    className={styles.modalDetailsCopyIcon}
                  >
                    <CopyComponent isCopied={isCopied === data.address} />
                  </div>
                </div>
              </div>
              <div className={styles.modalDetailsRow}>
                <div className={styles.modalDetailsRowText}>Network:</div>
                <div className={styles.modalDetailsRowSubText}>{data.networkId}</div>
              </div>

              {data.tag && (
                <div className={styles.modalDetailsRow}>
                  <div className={styles.modalDetailsRowText}>Memo:</div>
                  <div className={styles.modalDetailsRowSubTextWrap}>
                    <div className={styles.modalDetailsRowSubText}>{data.tag}</div>
                    <div
                      onClick={() => {
                        navigator.clipboard.writeText(data.tag).then(() => {
                          setIsCopied(data.tag)
                          setTimeout(() => {
                            setIsCopied('')
                          }, 2000)
                        })
                      }}
                      className={styles.modalDetailsCopyIcon}
                    >
                      <CopyComponent isCopied={isCopied === data.tag} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalDetailsBtnWrap}>
          <button className={'btn-new primary big'} onClick={action}>
            {'Edit '}
          </button>
          <button className={'btn-new transparent big'} onClick={() => Modal.close()}>
            {'Cancel'}
          </button>
        </div>
      </div>
    </>
  )
}
