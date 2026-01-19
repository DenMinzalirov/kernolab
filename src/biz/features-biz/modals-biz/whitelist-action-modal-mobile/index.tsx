import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { getNetworkIcon } from 'utils/get-network-icon'
import { WhitelistAddressResponse } from 'wip/services/white-list'
import { CheckedIcon } from 'icons'
import { CopyBizIcon } from 'icons/copy-biz'
import { $assetsListData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

type Props = {
  data: WhitelistAddressResponse
  handleDelete: (id: string) => void
  handleUpdate: (item: WhitelistAddressResponse) => void
}

export const WhitelistActionModalMobile = ({ data, handleDelete, handleUpdate }: Props) => {
  const [isCopied, setIsCopied] = useState<{ name: string; value: string } | null>(null)

  const networkIcon = getNetworkIcon(data.networkId)

  return (
    <div className={clsx(styles.container)}>
      <div className={styles.header}>
        <img src={networkIcon} alt='' className={styles.headerIcon} />
        <div className={styles.headerTitleWrap}>
          <div className={styles.headerTitle}>{data?.name}</div>
          <div className={styles.headerSubTitle}>{data?.networkId}</div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentRow}>
          <div className={styles.contentRowText}>Address</div>
          <div className={styles.contentRowSubTextWrap}>
            <div className={styles.contentRowSubText}>{data?.address}</div>
            {isCopied?.name === 'address' ? (
              <div className={styles.copyBtnIcon}>
                <CheckedIcon fill='#000' />
              </div>
            ) : (
              <div
                className={styles.copyBtnIcon}
                onClick={() => {
                  navigator.clipboard.writeText(data?.address).then(() => {
                    setIsCopied({ name: 'address', value: data?.address })
                    setTimeout(() => {
                      setIsCopied(null)
                    }, 1000)
                  })
                }}
              >
                {/* TODO use global color */}
                <CopyBizIcon fill='#000' />
              </div>
            )}
          </div>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.contentRowText}>Memo Tag</div>
          <div className={styles.contentRowSubTextWrap}>
            <div className={styles.contentRowSubText}>{data?.tag}</div>
            {isCopied?.name === 'tag' ? (
              <div className={styles.copyBtnIcon}>
                <CheckedIcon fill='#000' />
              </div>
            ) : (
              <div
                className={styles.copyBtnIcon}
                onClick={() => {
                  navigator.clipboard.writeText(data?.tag).then(() => {
                    setIsCopied({ name: 'tag', value: data?.tag })
                    setTimeout(() => {
                      setIsCopied(null)
                    }, 1000)
                  })
                }}
              >
                {/* TODO use global color */}
                <CopyBizIcon fill='#000' />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={clsx(styles.buttons)}>
        <button
          onClick={() => {
            Modal.close()
            handleUpdate(data)
          }}
          className='btn-biz blue'
          disabled={false}
        >
          Edit
        </button>

        <button
          onClick={() => {
            Modal.close()
            handleDelete(data.id)
          }}
          className='btn-biz grey'
          disabled={false}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
