import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useUnit } from 'effector-react'

import { getBalanceString } from 'utils'
import { ArrowIconSmall } from 'assets/icons/arrow-icon-small'

import { SelectAssetMobileBiz } from '../../../biz/features-biz/modals-biz/select-asset-mobile-biz'
import { Modal } from '../../../components'
import { CombinedObject } from '../../../model/cefi-combain-assets-data'
import { $currency } from '../../../model/currency'
import { ExchangeInputs } from './exchange'
import stylesBiz from './styles-biz.module.scss'

type AmountInput = {
  asset: CombinedObject
  currencyAmount: string
  direction: 'from' | 'to'
  setFocusName: React.Dispatch<string>
  methods: any
  assetsList: CombinedObject[]
  setSelectedData: any
}

export function AmountInputMobile({
  methods,
  asset,
  direction,
  setFocusName,
  currencyAmount,
  assetsList,
  setSelectedData,
}: AmountInput) {
  const currency = useUnit($currency)

  const {
    register,
    formState: { errors },
    setValue,
  } = methods

  const handleInputChange = (e: any, name: string): void => {
    const cleanedValue = e.target.value.replace(/[^0-9.,]/g, '')
    const sanitizedValue = cleanedValue.replace(',', '.').replace(/(\..*)\./g, '$1')
    // @ts-ignore
    setValue(name, sanitizedValue)
  }

  const handleSelectAsset = () => {
    Modal.open(<SelectAssetMobileBiz assetsList={assetsList} setSelectedData={setSelectedData} />, {
      variant: 'down-mobile',
    })
  }

  return (
    <div className={stylesBiz.mobileInputFromWrap}>
      <div className={stylesBiz.enterAmount} style={{ textTransform: 'capitalize' }}>
        {direction}
      </div>

      <div className='input-item-wrap-biz'>
        <input
          style={{
            paddingRight: 120,
            fontSize: 20,
            lineHeight: '25.52px',
            padding: 0,
            border: 0,
            width: '58%',
            borderRadius: 0,
            height: 34,
          }}
          id='fromAmountCrypto'
          type='text'
          className='input-form'
          placeholder='0.00'
          onInput={e => handleInputChange(e, `${direction}AmountCrypto`)}
          onFocus={() => {
            setFocusName(`${direction}AmountCrypto`)
          }}
          {...register(`${direction}AmountCrypto`, {
            required: true,
            onBlur: () => {
              setFocusName('')
            },
          })}
        />
        <div onClick={handleSelectAsset} className={stylesBiz.exchangeMobileInputWrap}>
          <img alt={''} src={asset.icon} style={{ width: 20, height: 20 }} className='asset-icon' />
          <div className={stylesBiz.inputAsset}>{asset.assetId}</div>
          <ArrowIconSmall className={stylesBiz.inputIcon} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className={stylesBiz.enterAmount}>
          {getBalanceString(currencyAmount ? +currencyAmount : 0, 2)} {currency.type.toUpperCase()}
        </div>
        <div className={stylesBiz.enterAmount}>
          Balance: {getBalanceString(asset ? +asset.availableBalance : 0, 8)} {asset?.symbol || ''}
        </div>
      </div>
    </div>
  )
}
