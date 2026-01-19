import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown } from 'components'
import { OTCPair } from 'wip/services/otc'
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { $pairsOTC } from 'model/otc'

import { OtcNewRequestForm } from './otc-new-request'
import styles from './styles.module.scss'

type Props = {
  methods: any
}

export type FromAndToAsset = {
  assetId: string
  icon: string
  minimalAmount: string
  availableBalance: string
}

const getUniqueAssets = (combinedAssets: CombinedObject[], otcPairs: OTCPair[]) => {
  const fromAssetsMap = new Map<string, FromAndToAsset>()
  const toAssetsMap = new Map<string, FromAndToAsset>()

  otcPairs.forEach(pair => {
    const fromAsset = combinedAssets.find(asset => asset.assetId === pair.fromAssetId)
    const toAsset = combinedAssets.find(asset => asset.assetId === pair.toAssetId)

    if (fromAsset) {
      fromAssetsMap.set(fromAsset.assetId, {
        assetId: fromAsset.assetId,
        icon: fromAsset.icon,
        minimalAmount: pair.minimalAmount,
        availableBalance: fromAsset.availableBalance.toString(),
      })
    }

    if (toAsset) {
      toAssetsMap.set(toAsset.assetId, {
        assetId: toAsset.assetId,
        icon: toAsset.icon,
        minimalAmount: pair.minimalAmount,
        availableBalance: toAsset.availableBalance.toString(),
      })
    }
  })

  const fromAssets = Array.from(fromAssetsMap.values())
  const toAssets = Array.from(toAssetsMap.values())

  return { fromAssets, toAssets }
}

export const OtcStepTradeDetails = ({ methods }: Props) => {
  const pairsOTC = useUnit($pairsOTC)
  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  const allAssets: CombinedObject[] = [...assets, assetEurData] as CombinedObject[]

  const [fromAssetsState, setFromAssetsState] = useState<FromAndToAsset[]>([])
  const [toAssetsState, setToAssetsState] = useState<FromAndToAsset[]>([])
  const [minAmount, setMinAmount] = useState('')

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = methods

  const watchFromAsset = watch('fromAsset')
  const watchToAsset = watch('toAsset')

  useEffect(() => {
    if (watchFromAsset && watchToAsset) {
      const pairs = pairsOTC.find(
        item => item.fromAssetId === watchFromAsset.assetId && item.toAssetId === watchToAsset.assetId
      )
      const min = pairs?.minimalAmount ? +pairs.minimalAmount : ''
      setMinAmount(min.toString())
    } else {
      setMinAmount('')
    }
  }, [watchFromAsset, watchToAsset])

  useEffect(() => {
    if (watchToAsset && pairsOTC.length) {
      const filterPairsOTC = pairsOTC.filter(asset => asset.toAssetId === watchToAsset.assetId)
      const data = getUniqueAssets(allAssets, filterPairsOTC)
      setFromAssetsState(data.fromAssets)
    } else {
      const data = getUniqueAssets(allAssets, pairsOTC)
      setFromAssetsState(data.fromAssets)
    }

    if (watchFromAsset && pairsOTC.length) {
      const filterPairsOTC = pairsOTC.filter(asset => asset.fromAssetId === watchFromAsset.assetId)
      const data = getUniqueAssets(allAssets, filterPairsOTC)
      setToAssetsState(data.toAssets)
    } else {
      const data = getUniqueAssets(allAssets, pairsOTC)
      setToAssetsState(data.toAssets)
    }
  }, [pairsOTC, watchFromAsset, watchToAsset, assets, assetEurData])

  const fromAssetId = watchFromAsset?.assetId

  const handleSetMinAmount = () => {
    setValue('amount', minAmount.toString())
    clearErrors()
  }

  const itemComponent = (item: FromAndToAsset) => {
    return (
      <div>
        {item ? (
          <div className={styles.itemComponent}>
            <img src={item.icon} className={styles.icon} alt='' />
            {item?.assetId}
          </div>
        ) : (
          <div className={styles.itemComponentPlaceholder}>Choose an asset</div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.stepOneContainer}>
      <div style={{ height: 60 }}></div>

      <div className={styles.stepOneTitle}>OTC Request</div>

      <div className={styles.assetSelection}>
        <div className={styles.assetSelectionItem}>
          <div className={styles.inputLabel}>From</div>
          <CommonDropdown
            data={fromAssetsState}
            itemComponent={itemComponent}
            setSelectedData={value => setValue('fromAsset', value)}
            selectedData={watchFromAsset}
            isClearButton={true}
            showDropdownForSingleItem={true}
          />
        </div>

        <div className={styles.assetSelectionItem}>
          <div className={styles.inputLabel}>To</div>
          <CommonDropdown
            data={toAssetsState}
            itemComponent={itemComponent}
            setSelectedData={value => setValue('toAsset', value)}
            selectedData={watchToAsset}
            isClearButton={true}
            showDropdownForSingleItem={true}
          />
        </div>
      </div>

      {watchFromAsset && watchToAsset ? (
        <div className={styles.amountContainer}>
          <div className={clsx(styles.inputLabel, { [styles.colorRed]: errors.amount })}>Enter Amount</div>
          <div className={styles.inputWrapper}>
            <input
              inputMode='decimal'
              className={clsx(styles.input, { [styles.inputError]: errors.amount })}
              placeholder={`Min Amount  ${minAmount} ${fromAssetId}`}
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: minAmount,
                  message: `The amount entered is below the required minimum of ${minAmount} ${fromAssetId}`,
                },
                onChange(event: any) {
                  const value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                  setValue('amount', value.trim())
                },
                validate: (value: any) => {
                  if (!/^\d*\.?\d*$/.test(value)) {
                    return 'Please enter a valid number (integer or decimal)'
                  }
                  return true
                },
              })}
              onKeyDown={e => {
                if (
                  !/[0-9.,]/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'Delete' &&
                  e.key !== 'Tab'
                ) {
                  e.preventDefault()
                }
              }}
            />

            <div className={styles.actionContainer}>
              <div onClick={handleSetMinAmount} className={styles.inputBtnText}>
                Min
              </div>
              <div className={styles.inputAssetId}>{watchFromAsset?.assetId}</div>
            </div>
          </div>

          {watchFromAsset ? (
            <div className={styles.availableBalance}>
              Balance: {watchFromAsset?.availableBalance} {watchFromAsset?.assetId}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
