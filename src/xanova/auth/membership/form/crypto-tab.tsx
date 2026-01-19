import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

import { AssetsServices, AssetWithNetworks } from 'wip/services'
import { CryptoDepositsServices } from 'wip/services/crypto-deposits'
import { XanovaServices } from 'wip/services/xanova-services/xanova'

import styles from './styles.module.scss'
import { CopyIconButton } from 'xanova/components/copy-icon-button'

type Inputs = {
  asset: string
  network: string
  depositAddress: string
}

const defaultValues = {
  asset: '',
  network: '',
  depositAddress: '',
}

export function CryptoTab() {
  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = methods

  const [assets, setAssets] = useState<AssetWithNetworks[]>([])
  const [isAssetsLoading, setIsAssetsLoading] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [membershipPrices, setMembershipPrices] = useState<Record<string, string>>({})

  const selectedAsset = watch('asset')
  const selectedNetwork = watch('network')
  const depositAddress = watch('depositAddress') || ''
  const selectedAssetTotal = selectedAsset ? membershipPrices[selectedAsset] : undefined

  const assetField = register('asset', { required: true })
  const networkField = register('network', { required: true })
  const depositField = register('depositAddress', { required: true })

  useEffect(() => {
    let isActive = true
    const fetchAssets = async () => {
      try {
        setIsAssetsLoading(true)
        const [assetsResponse, membershipPricesResponse] = await Promise.all([
          AssetsServices.getCryptoDepositWithdrawal(), //TODO chenge model
          XanovaServices.getMembershipPrices(),
        ])
        if (!isActive) return
        setAssets(assetsResponse.assets)
        setMembershipPrices(membershipPricesResponse)
      } catch (error) {
        console.error('Failed to load crypto assets', error)
        if (!isActive) return
        setAssets([])
        setMembershipPrices({})
      } finally {
        if (isActive) {
          setIsAssetsLoading(false)
        }
      }
    }

    fetchAssets()

    return () => {
      isActive = false
    }
  }, [])

  const assetOptions = useMemo(
    () =>
      assets
        .filter(asset => membershipPrices[asset.assetId] !== undefined)
        .map(asset => ({
          value: asset.assetId,
          label: asset.assetId,
        })),
    [assets, membershipPrices]
  )

  const networkOptions = useMemo(() => {
    if (!selectedAsset) {
      return []
    }
    const asset = assets.find(item => item.assetId === selectedAsset)
    return asset?.networks.filter(network => network.depositAvailable) ?? []
  }, [assets, selectedAsset])

  useEffect(() => {
    if (!selectedAsset || !selectedNetwork) {
      setValue('depositAddress', '', { shouldDirty: false, shouldValidate: false })
      return
    }

    let isActive = true

    const fetchAddress = async () => {
      try {
        setIsAddressLoading(true)
        const response = await CryptoDepositsServices.getCryptoAddressForAsset(selectedAsset, selectedNetwork)
        if (!isActive) return
        const preferredAddress =
          response.addresses.find(address => address.addressType === 'ADDRESS') ?? response.addresses[0]
        setValue('depositAddress', preferredAddress?.address ?? '', { shouldDirty: false, shouldValidate: true })
      } catch (error) {
        console.error('Failed to load deposit address', error)
        if (!isActive) return
        setValue('depositAddress', '', { shouldDirty: false, shouldValidate: false })
      } finally {
        if (isActive) {
          setIsAddressLoading(false)
        }
      }
    }

    fetchAddress()

    return () => {
      isActive = false
    }
  }, [selectedAsset, selectedNetwork, setValue])

  return (
    <div className={styles.tabContent}>
      <div className={styles.flexHorizontalGap12}>
        <div className={clsx('select-wrap-xanova', errors.asset && 'error')}>
          <label htmlFor='Asset' className={errors.asset ? 'text-error' : ''}>
            Asset
          </label>
          <select
            id='Asset'
            className={clsx(!selectedAsset && 'placeholder', errors.asset && 'error')}
            defaultValue=''
            disabled={isAssetsLoading}
            {...assetField}
            onChange={event => {
              assetField.onChange(event)
              setValue('network', '', { shouldDirty: false, shouldValidate: false })
              setValue('depositAddress', '', { shouldDirty: false, shouldValidate: false })
            }}
          >
            <option value='' disabled>
              {isAssetsLoading ? 'Loading...' : 'Select asset'}
            </option>
            {assetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={clsx('select-wrap-xanova', errors.network && 'error')}>
          <label htmlFor='network' className={errors.network ? 'text-error' : ''}>
            Network
          </label>
          <select
            id='network'
            className={errors.network && 'error'}
            defaultValue=''
            disabled={!selectedAsset || networkOptions.length === 0}
            {...networkField}
            onChange={event => {
              networkField.onChange(event)
              setValue('depositAddress', '', { shouldDirty: false, shouldValidate: false })
            }}
          >
            <option value='' disabled>
              {!selectedAsset
                ? 'Select asset first'
                : networkOptions.length === 0
                  ? 'No networks available'
                  : 'Select network'}
            </option>
            {networkOptions.map(option => (
              <option key={option.networkId} value={option.networkId}>
                {option.networkId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='input-wrap-xanova'>
        <label htmlFor='depositAddress' className={errors.depositAddress ? 'text-error' : ''}>
          Deposit Address
        </label>
        <input
          {...depositField}
          id='depositAddress'
          type='text'
          className={errors.depositAddress ? ' error' : ''}
          value={depositAddress}
          readOnly
          placeholder={isAddressLoading ? 'Loading address...' : 'Select asset and network to show address'}
        />
        <CopyIconButton
          value={depositAddress}
          disabled={!depositAddress || isAddressLoading}
          className={styles.copyAddressButton}
          ariaLabel='Copy deposit address'
        />
      </div>

      <div className={styles.totalInfo}>
        <p className={styles.text}>Total:</p>
        <p className={styles.value}>
          {selectedAssetTotal !== undefined ? `${selectedAssetTotal} ${selectedAsset}` : '-'}
        </p>
      </div>

      {
        <div className={styles.paddingText}>
          {
            // eslint-disable-next-line max-len
            'Please wait while we confirm the transaction on the blockchain.\nThis usually takes a few minutes, depending on network activity.'
          }
        </div>
      }
    </div>
  )
}
