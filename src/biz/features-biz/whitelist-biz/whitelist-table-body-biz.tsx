import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { MenuWithActions } from 'components/menu-with-actions'
import { getNetworkIcon } from 'utils/get-network-icon'
import { WhitelistAddressResponse } from 'wip/services/white-list'
import { CircleCheckIcon } from 'icons/circle-check-icon'
import { CopyBizIcon } from 'icons/copy-biz'
import { DeleteIcon } from 'icons/delete-icon'
import { EditIcon } from 'icons/edit-icon'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'

import styles from './styles.module.scss'
import { shortedAddress } from './utils/shorted-address'
import { BREAKPOINT, useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  data: WhitelistAddressResponse[]
  handleDelete: (id: string) => void
  handleUpdate: (item: WhitelistAddressResponse) => void
  handleTableRowClick: (data: WhitelistAddressResponse) => void
}

export const WhitelistTableBodyBiz = ({ data, handleDelete, handleUpdate, handleTableRowClick }: Props) => {
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const isSecurityBlock = !!securityTimerData?.expiresAt
  const { currentBreakpointBiz, isMobileBiz } = useCurrentBreakpoint()

  const [isCopied, setIsCopied] = useState(-1)

  const visibleCharsAdrress = isMobileBiz ? 3 : currentBreakpointBiz === BREAKPOINT.lg ? 6 : 0

  return (
    <div className={styles.tableRowsWrap}>
      {data.map((item, index) => {
        const networkIcon = getNetworkIcon(item.networkId)

        return (
          <div onClick={() => handleTableRowClick(item)} className={styles.tableRow} key={item.id}>
            {/* Network */}
            <div className={styles.cell1}>
              <img className={clsx('asset-icon', styles.assetIcon)} src={networkIcon} alt='Icon' />
              <div className={styles.assetItem}>
                <div className={styles.textLableLgAndMd}>{item.name}</div>
                <div className={styles.tableRowTextNetworkId}>{item.networkId}</div>
              </div>
            </div>

            {/* Label */}
            <div className={clsx(styles.cell2, styles.tableRowTextLable)}>{item.name}</div>

            {/* Address and Tag for lg md*/}
            <div className={styles.cell3}>
              <div className={clsx(styles.tableRowTextAddress)}>
                {shortedAddress(item.address, visibleCharsAdrress)}{' '}
              </div>
              <div
                className={styles.iconCopy}
                onClick={() => {
                  navigator.clipboard.writeText(item.address).then(() => {
                    setIsCopied(index)
                    setTimeout(() => {
                      setIsCopied(-1)
                    }, 1000)
                  })
                }}
              >
                {isCopied === index ? <CircleCheckIcon /> : <CopyBizIcon fill='#564DB5' />}
              </div>

              <div className={styles.textTagLgAndMd}>{item.tag}</div>
            </div>

            {/* Tag */}
            <div className={clsx(styles.cell4, styles.tableRowTextTag)}>{item.tag || '-'}</div>

            {/* Action */}
            <div className={styles.cell5}>
              <div className={clsx(styles.actionButtons, styles.hideXlAndDown)}>
                <button onClick={() => handleUpdate(item)} className='btn-biz blue' disabled={isSecurityBlock}>
                  Edit
                </button>

                <button onClick={() => handleDelete(item.id)} className='btn-biz grey' disabled={false}>
                  Delete
                </button>
              </div>

              {/* only xl lg */}
              <div className={clsx(styles.menuDotsWrap)}>
                <MenuWithActions
                  actions={[
                    {
                      label: 'Edit',
                      icon: <EditIcon />,
                      onClick: () => handleUpdate(item),
                      disabled: isSecurityBlock,
                    },
                    {
                      label: 'Delete',
                      icon: <DeleteIcon />,
                      onClick: () => handleDelete(item.id),
                      disabled: false,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
