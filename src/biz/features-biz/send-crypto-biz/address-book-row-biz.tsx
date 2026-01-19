import { useUnit } from 'effector-react'

import { $assetsListData } from '../../../model/cefi-combain-assets-data'
import { getNetworkIcon } from '../../../utils/get-network-icon'
import { WhitelistAddressResponse } from '../../../wip/services/white-list'
import styles from './styles.module.scss'

type AddressBookRowProps = {
  action: (arg: WhitelistAddressResponse) => void
  address: WhitelistAddressResponse
}

export function AddressBookRowBiz({ action, address }: AddressBookRowProps) {
  const assets = useUnit($assetsListData)

  const shortenAddress = (addressItem: string) => {
    if (addressItem.length <= 10) return addressItem
    return `${addressItem.slice(0, 3)}..${addressItem.slice(-3)}`
  }

  const networkIcon = getNetworkIcon(address.networkId)

  // const customIcon =
  //   assets.find(assetItem => {
  //     if (address.networkId === 'BSC') return assetItem.assetId === 'BNB'
  //     return assetItem.assetId === address.networkId
  //   })?.icon || assets.find(assetItem => assetItem.assetId === 'FI')?.icon

  return (
    <div onClick={() => action(address)} className={styles.whiteListItem}>
      <img style={{ height: 40, width: 40, marginRight: 12 }} src={networkIcon} alt={''} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1,
        }}
      >
        <div
          className={styles.titleWhiteListItem}
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {address.name}
        </div>
        <div
          className={styles.descriptionWhiteListItem}
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {address.networkId} network
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginLeft: 'auto',
          alignItems: 'flex-end',
        }}
      >
        <div
          className={styles.titleWhiteListItem}
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {shortenAddress(address.address)}
        </div>
        <div className={styles.descriptionWhiteListItem}>{address.tag}</div>
      </div>
    </div>
  )
}
