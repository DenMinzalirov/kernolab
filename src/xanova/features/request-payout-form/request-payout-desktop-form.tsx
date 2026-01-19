import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, Modal } from 'components'
import { pages } from 'constant'
import { validateAddress } from 'utils'
import { handleError } from 'utils/error-handler'
import { $requestPayoutForm, requestPayoutFormEv, RequestPayoutFormValues } from 'model'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $membershipStatus } from 'model/membership-status'
import { $stepUpBlockExpiration, stepUpBlockExpirationFx } from 'model/step-up-block-expiration'
import { $twoFaStatus } from 'model/two-fa'

import {
  DEFAULT_PAYOUT_METHOD_OPTION,
  REQUEST_PAYOUT_METHOD_TABS,
  REQUEST_PAYOUT_METHODS,
} from '../../constants/request-payout-methods'
import styles from './styles.module.scss'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

type Inputs = {
  amount: string
  network: string
  address: string
  iban: string
  beneficiaryName: string
}

export function RequestPayoutDesktopForm() {
  const navigate = useNavigate()

  const assetsListData = useUnit($assetsListData)
  const requestPayoutForm = useUnit($requestPayoutForm)
  const twoFaStatus = useUnit($twoFaStatus)
  const stepUpBlockExpiration = useUnit($stepUpBlockExpiration)
  const membershipStatus = useUnit($membershipStatus)

  const initialMethod = requestPayoutForm.method || REQUEST_PAYOUT_METHOD_TABS.CRYPTO
  const initialAssetId =
    requestPayoutForm.assetId ||
    REQUEST_PAYOUT_METHODS.find(option => option.method === initialMethod)?.assetId ||
    DEFAULT_PAYOUT_METHOD_OPTION?.assetId ||
    ''

  const [initialPrepareData] = useState<RequestPayoutFormValues | undefined>(() => requestPayoutForm)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(initialPrepareData?.network || null)
  const [selectedMethod, setSelectedMethod] = useState<RequestPayoutFormValues['method']>(initialMethod)
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId)
  const [isLoading, setIsLoading] = useState(false)

  const selectedAsset = useMemo(
    () => assetsListData.find(asset => asset.assetId === selectedAssetId) ?? null,
    [assetsListData, selectedAssetId]
  )

  useEffect(() => {
    const option = REQUEST_PAYOUT_METHODS.find(item => item.assetId === selectedAssetId)
    if (option && option.method !== selectedMethod) {
      setSelectedMethod(option.method)
    }
  }, [selectedAssetId, selectedMethod])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm<Inputs>({
    defaultValues: {
      amount: initialPrepareData?.amount || '',
      network: initialPrepareData?.network || '',
      address: initialPrepareData?.walletAddress || '',
    },
  })

  //NETWORK
  const availableNetworks = useMemo(
    () =>
      selectedAsset?.networksInfo
        .filter(networkInfo => networkInfo.withdrawalAvailable)
        .map(networkInfo => networkInfo.networkId),
    [selectedAsset]
  )

  useEffect(() => {
    if (!availableNetworks || availableNetworks.length === 0) {
      setSelectedNetworkId(null)
      return
    }

    if (!selectedNetworkId || !availableNetworks.includes(selectedNetworkId)) {
      setSelectedNetworkId(availableNetworks[0])
    }
  }, [availableNetworks, selectedNetworkId])
  //END NETWORK

  //MINIMUM AMOUNT
  const minimumWithdrawalAmount = useMemo(
    () =>
      selectedAsset?.networksInfo.find(
        networkInfo => networkInfo.withdrawalAvailable && networkInfo.networkId === selectedNetworkId
      )?.minimumWithdrawalAmount,
    [selectedAsset, selectedNetworkId]
  )
  //END MINIMUM AMOUNT

  const isCryptoMethod = selectedMethod === REQUEST_PAYOUT_METHOD_TABS.CRYPTO
  const isBankMethod = selectedMethod === REQUEST_PAYOUT_METHOD_TABS.BANK

  const showSecurityTimerModal = () => {
    Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
  }

  const handleMethodChange = (assetId: string, method: RequestPayoutFormValues['method']) => {
    setSelectedAssetId(assetId)
    setSelectedMethod(method)
    if (method !== REQUEST_PAYOUT_METHOD_TABS.CRYPTO) {
      setSelectedNetworkId(null)
    }
  }

  const onSubmitCrypto = async (data: Inputs) => {
    setIsLoading(true)
    const isValidAddress = await validateAddress(data.address, selectedNetworkId || '')

    if (!isValidAddress) {
      setIsLoading(false)
      setError('address', { type: 'validate', message: 'Invalid' })
      return
    }

    if (!twoFaStatus) {
      setIsLoading(false)
      handleError({ message: 'TWO_FA_OFF' })
      return
    }

    if (!isCryptoMethod || !selectedAssetId || !selectedNetworkId) {
      setIsLoading(false)
      return
    }

    const stepUpBlockInfo = stepUpBlockExpiration?.expiresAt || (await stepUpBlockExpirationFx()).expiresAt

    if (stepUpBlockInfo) {
      setIsLoading(false)
      showSecurityTimerModal()
      return
    }

    setIsLoading(false)

    requestPayoutFormEv({
      amount: data.amount,
      assetId: selectedAssetId,
      network: selectedNetworkId || '',
      walletAddress: data.address,
      method: selectedMethod,
    })

    navigate(pages.REQUEST_PAYOUT.path)
  }

  const onSubmitBank = async (data: Inputs) => {
    if (!isBankMethod || !data.iban || !data.beneficiaryName || !data.amount) {
      return
    }

    if (!twoFaStatus) {
      handleError({ message: 'TWO_FA_OFF' })
      return
    }
    setIsLoading(true)
    const stepUpBlockInfo = stepUpBlockExpiration?.expiresAt || (await stepUpBlockExpirationFx()).expiresAt

    if (stepUpBlockInfo) {
      showSecurityTimerModal()
      setIsLoading(false)
      return
    }

    requestPayoutFormEv({
      amount: data.amount,
      assetId: '',
      iban: data.iban,
      beneficiaryName: data.beneficiaryName,
      method: selectedMethod,
    })

    setIsLoading(false)
    navigate(pages.REQUEST_PAYOUT.path)
  }

  const onSubmit = (data: Inputs) => {
    if (isCryptoMethod) {
      onSubmitCrypto(data)
    }

    if (isBankMethod) {
      onSubmitBank(data)
    }
  }

  const itemComponent = (value: string) => {
    if (!value) return <div className={styles.networkPlaceholder}>Please select</div>

    return <div className={styles.networkActive}>{value}</div>
  }

  const renderCryptoFields = () => (
    <>
      <div style={{ position: 'relative' }}>
        <p className={clsx(styles.networkLabel, errors.network ? styles.networkLabelError : '')}>
          Network {errors.network?.message}
        </p>
        <CommonDropdown
          data={availableNetworks || []}
          selectedData={selectedNetworkId}
          itemComponent={itemComponent}
          setSelectedData={option => {
            setSelectedNetworkId(option)
          }}
        />
      </div>

      <div className='input-wrap-xanova'>
        <label htmlFor='address' className={errors.address ? 'text-error' : ''}>
          Wallet Address {errors.address?.message}
        </label>
        <input
          id='address'
          type='text'
          className={clsx(errors.address && 'error')}
          placeholder='Type here..'
          {...register('address', {
            required: 'Required',
            setValueAs: value => (typeof value === 'string' ? value.trim() : value),
          })}
        />
      </div>
    </>
  )

  const renderBankFields = () => (
    <>
      <div className='input-wrap-xanova'>
        <label htmlFor='iban' className={errors.iban ? 'text-error' : ''}>
          IBAN {errors.iban?.message}
        </label>
        <input
          id='iban'
          type='text'
          className={clsx(errors.iban && 'error')}
          placeholder='Type here..'
          {...register('iban', {
            required: 'Required',
            setValueAs: value => (typeof value === 'string' ? value.trim() : value),
          })}
        />
      </div>

      <div className='input-wrap-xanova'>
        <label htmlFor='beneficiaryName' className={errors.beneficiaryName ? 'text-error' : ''}>
          Beneficiary Name {errors.beneficiaryName?.message}
        </label>
        <input
          id='beneficiaryName'
          type='text'
          className={clsx(errors.beneficiaryName && 'error')}
          placeholder='Type here..'
          {...register('beneficiaryName', {
            required: 'Required',
            setValueAs: value => (typeof value === 'string' ? value.trim() : value),
          })}
        />
      </div>
    </>
  )

  return (
    <div className={styles.containerDesktop}>
      <div className={styles.contentWrap}>
        <form className={styles.containerForm} onSubmit={handleSubmit(onSubmit)}>
          <h2 className={styles.titleForm}>Request Payout</h2>

          <div className='input-wrap-xanova'>
            <label htmlFor='amount' className={errors.amount ? 'text-error' : ''}>
              {errors.amount ? '' : 'Amount'} {errors.amount?.message}
            </label>
            <input
              id='amount'
              type='text'
              className={clsx(errors.amount && 'error')}
              placeholder='Type here..'
              inputMode='decimal'
              {...register('amount', {
                required: 'Required',
                min: {
                  value: minimumWithdrawalAmount || 0,
                  message: `minimum amount is ${+(minimumWithdrawalAmount || 0)}`,
                },
                max: {
                  value: +(membershipStatus.availableCommissions || Infinity),
                  message: 'Insufficient balance',
                },
                validate: value => (!!value && Number(value) > 0 ? true : 'Invalid amount'),
                onChange: event => {
                  const value = event.target.value
                  setValue('amount', value.replace(',', '.'), { shouldValidate: true })
                },
              })}
            />
            <span className='currency'>$</span>
          </div>

          <div>
            <p className={styles.methodLabel}>Method</p>
            <div className={styles.radioGroup} role='radiogroup' aria-label='Payout method'>
              {REQUEST_PAYOUT_METHODS.map(method => (
                <label key={method.assetId} className='radio-wrap-xanova' htmlFor={`payout-${method.assetId}`}>
                  <input
                    id={`payout-${method.assetId}`}
                    type='radio'
                    value={method.assetId}
                    checked={selectedAssetId === method.assetId}
                    onChange={() => {
                      handleMethodChange(method.assetId, method.method)
                    }}
                    disabled={method.disabled}
                  />
                  <span className='radio-xanova-box' />
                  <span className='radio-xanova-text'>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {isCryptoMethod && renderCryptoFields()}

          {isBankMethod && renderBankFields()}

          <button type='submit' className={clsx('btn-xanova gold', styles.button)}>
            {isLoading ? <span className='spinner-border black' /> : 'Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
