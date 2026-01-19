import React, { ReactElement } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { getNetworkIcon } from 'utils/get-network-icon'
import { $assetsListData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

type Props = {
  isLoading: boolean
  methods: any
  selectedNetworkId: string | null
  setSelectedNetworkId: React.Dispatch<React.SetStateAction<string | null>>
  availableNetworksId?: string[]
}

export function WhitelistFormBiz({
  isLoading,
  methods,
  selectedNetworkId,
  setSelectedNetworkId,
  availableNetworksId,
}: Props) {
  const assets = useUnit($assetsListData)

  const networksId = availableNetworksId
    ? availableNetworksId
    : [
        ...new Set(
          assets
            .map(asset => asset.networksInfo)
            .flat()
            .map(network => network.networkId)
        ),
      ]

  const {
    register,
    formState: { errors },
  } = methods

  const itemComponentNetwork = (selectedItemNetworkId: string): ReactElement => {
    if (!selectedItemNetworkId) return <div />

    const networkIcon = getNetworkIcon(selectedItemNetworkId)

    return (
      <div
        onClick={() => {
          if (isLoading) return
          setSelectedNetworkId(selectedItemNetworkId)
        }}
        className={styles.itemWrap}
      >
        <img className={styles.icon} src={networkIcon} alt='' />
        {selectedItemNetworkId}
      </div>
    )
  }

  return (
    <>
      <div className={clsx(styles.label, errors.address && styles.colorRed)}>
        Address {errors.address && errors.address?.type === 'required' ? ' Required' : ''}
      </div>
      <div className='input-item-wrap-biz'>
        <input
          className={clsx(`input-form ${errors.address ? 'error' : ''}`)}
          id='address'
          type='text'
          placeholder='Type here..'
          {...register('address', { required: true })}
        />
      </div>

      <div className={styles.dropdownWrap}>
        <div className={clsx(styles.label, errors.network && styles.colorRed)}>Network</div>
        <CommonDropdownBiz
          data={networksId || []}
          itemComponent={itemComponentNetwork}
          setSelectedData={setSelectedNetworkId}
          selectedData={selectedNetworkId}
          isError={!!errors.network}
        />
      </div>

      <div className={clsx(styles.label, errors.memo && styles.colorRed)}>Memo Tag</div>
      <div className='input-item-wrap-biz'>
        <input
          id='memo'
          type='text'
          className={clsx(`input-form ${errors.memo ? 'error' : ''}`)}
          placeholder='Type here..'
          {...register('memo')}
        />
      </div>

      <div className={clsx(styles.label, errors.addressLabel && styles.colorRed)}>
        Address Label {errors.addressLabel && errors.addressLabel?.type === 'required' ? ' Required' : ''}
      </div>
      <div className='input-item-wrap-biz'>
        <input
          id='addressLabel'
          type='text'
          className={clsx(`input-form ${errors.addressLabel ? 'error' : ''}`)}
          placeholder='Type here..'
          {...register('addressLabel', { required: true })}
        />
      </div>
    </>
  )
}
