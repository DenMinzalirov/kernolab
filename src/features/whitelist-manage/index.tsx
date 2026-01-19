import { ReactElement, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import { t } from 'i18next'
import clsx from 'clsx'

import { CommonDropdown, HeaderTitle, Modal } from 'components'
import { HintMemo } from 'components/hint-memo'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { TwoFaRequiredModal } from 'features/modals/two-fa-required-modal'
import { StepControllerComponent } from 'features/step-controller'
import { SuccessPairs } from 'features/success-pairs'
import { validateAddress } from 'utils'
import { handleError } from 'utils/error-handler'
import { getNetworkIcon } from 'utils/get-network-icon'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import { AuthResponse, MFAAddAuthResponse, NetworkWithAssetInfo, StepUpAuthResponse } from 'wip/services'
import { WhitListServices } from 'wip/services/white-list'
import { TriangleIcon } from 'icons'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $twoFaStatus } from 'model/two-fa'
import { $whiteList, getWhiteListFx } from 'model/white-list'

import styles from './styles.module.scss'
import { useFindWhitelistAddress } from 'hooks/use-find-whitelist-address'

type Inputs = {
  address: string
  network: string
  memo: string
  addressName: string
}

const defaultValues = {
  address: '',
  network: '',
  memo: '',
  addressName: '',
}

const STEPS = {
  ADD: 'ADD',
  SUMMARY: 'SUMMARY',
  WARNING: 'WARNING',
}

export function WhitelistManage() {
  const navigate = useNavigate()
  const location = useLocation()
  const id = location.state?.id
  const twoFaStatus = useUnit($twoFaStatus)
  const whiteList = useUnit($whiteList)
  const updatedAddress = whiteList.find(address => address.id === id)
  const assets = useUnit($assetsListData)
  const availableNetworks = [
    ...new Set(
      assets
        .map(asset => asset.networksInfo)
        .flat()
        .map(network => network.networkId)
    ),
  ]
  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    // clearErrors,
  } = methods

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(STEPS.ADD)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(
    updatedAddress?.networkId || availableNetworks[0]
  )
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isSuccessful, setIsSuccessful] = useState(false)

  const watchAddress = watch('address')
  const watchMemo = watch('memo')
  const watchAddressName = watch('addressName')

  const foundWhiteAddress = useFindWhitelistAddress({
    address: watchAddress,
    networkId: selectedNetwork || '',
    tag: watchMemo,
    name: watchAddressName,
  })

  useEffect(() => {
    if (updatedAddress) {
      setValue('address', updatedAddress.address)
      setValue('network', updatedAddress.networkId)
      setValue('addressName', updatedAddress.name)
      setValue('memo', updatedAddress.tag)
    }
  }, [updatedAddress])

  const handleBack = () => {
    if (!id) {
      navigate(-1)
      return
    }

    if (step === STEPS.SUMMARY) {
      Modal.open(
        <div className={styles.modalContent}>
          <div className={styles.modalTextWrap}>
            <div className={styles.modalTitle}>Warning:</div>
            <div className={styles.modalSubTitle}>
              If you close this window, any unsaved changes will be lost.
              <br />
              Do you want to proceed?
            </div>
          </div>
          <div className={styles.modalBtnGroup}>
            <button
              className={'btn-new red'}
              onClick={() => {
                navigate(-1)
                Modal.close()
              }}
            >
              Close Without Changes
            </button>

            <button className={'btn-new transparent'} onClick={() => Modal.close()}>
              Return to Update
            </button>
          </div>
        </div>,
        {
          variant: 'center',
        }
      )
    } else {
      navigate(-1)
      Modal.close()
    }
  }

  const handleNext = async () => {
    setIsLoading(true)

    try {
      if (step === STEPS.ADD) {
        const isValidAddress = selectedNetwork ? await validateAddress(watchAddress, selectedNetwork) : ''

        if (!isValidAddress) {
          setError('address', {
            type: 'validate',
            message: 'Invalid',
          })
          setIsLoading(false)
          return
        }
        setStep(STEPS.SUMMARY)
      }

      if (step === STEPS.SUMMARY) {
        const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
        stepUpRes && setResponse(stepUpRes)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    try {
      setIsLoading(true)
      if (updatedAddress && id) {
        await WhitListServices.updateAddressWhitelist(
          {
            name: watchAddressName,
            networkId: selectedNetwork || '',
            address: watchAddress,
            tag: watchMemo,
          },
          id,
          (responseData as StepUpAuthResponse).oneTimeAccessToken
        )
      } else {
        await WhitListServices.addAddressWhitelist(
          {
            name: watchAddressName,
            networkId: selectedNetwork || '',
            address: watchAddress,
            tag: watchMemo,
          },
          (responseData as StepUpAuthResponse).oneTimeAccessToken
        )
      }

      await getWhiteListFx()
      setIsSuccessful(true)
    } catch (error) {
      console.log('lastStepWithdrawal-ERROR', error)
      handleError(error)
      setResponse(null)
      setStep(STEPS.ADD)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackButton = () => {
    setStep(STEPS.ADD)
  }

  const itemComponentAddresses = (selectedItemAddressId: string): ReactElement => {
    if (!selectedItemAddressId) return <div className={styles.dropdownPlaceholder}>Choose from the list</div>

    const networkIcon = getNetworkIcon(selectedItemAddressId)

    return (
      <div className={styles.dropdownItemRow}>
        <img className={clsx('asset-icon', styles.dropdownItemRowIcon)} src={networkIcon} alt='' />

        <div className={styles.dropdownItemRowTitle}>{selectedItemAddressId}</div>
      </div>
    )
  }

  const btnName = () => {
    if (step === STEPS.SUMMARY && updatedAddress) return 'Update'
    return 'Next'
  }

  const isDisabled = () => {
    return !!foundWhiteAddress
  }

  const successfulName = id ? 'Address Updated Successfully' : 'Address Added\nto\u00A0Whitelist Successfully'
  const successfulDescription = id
    ? 'Your whitelisted address has been successfully updated. You can now use this address for transactions as needed.'
    : 'Your whitelisted address has been successfully added. You can now use it for secure transactions.'
  const successfulHeaderTitle = id ? 'Update Address' : 'Add New Address'

  if (isSuccessful) {
    return (
      <SuccessPairs
        title={successfulName}
        description={successfulDescription}
        headerTitle={successfulHeaderTitle}
        btnText={'Go Back to Whitelist'}
        btnAction={() => navigate(pages.WHITELIST.path)}
      />
    )
  }

  if (!twoFaStatus) {
    Modal.open(<TwoFaRequiredModal />, { variant: 'center' })
    return <Navigate to={pages.WHITELIST.path} replace />
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'Whitelist'} showBackBtn backBtnAction={handleBack} />

      <div className={styles.containerWrap}>
        <div className={styles.container}>
          {step === STEPS.ADD && !response ? (
            <div className={styles.content}>
              <form style={{ position: 'relative' }} onSubmit={handleSubmit(handleNext)}>
                <div className={styles.title}>{updatedAddress ? 'Update Address' : 'Add New Address'}</div>

                <div className='input-item-wrap-new'>
                  <label htmlFor='addressName' className={`input-label ${errors.addressName ? 'text-error' : ''}`}>
                    Address Title{' '}
                    {errors.addressName && errors.addressName?.type === 'required' ? t('inputError.required') : ''}
                    {errors.addressName && errors.addressName?.type === 'validate' ? t('inputError.invalid') : ''}
                  </label>
                  <input
                    id='addressName'
                    type='text'
                    className={clsx('input-form', errors.addressName && 'error')}
                    placeholder='Type here..'
                    {...register('addressName', { required: true })}
                  />
                </div>

                <div className={styles.height20} />

                <div className='input-item-wrap-new'>
                  <label htmlFor='address' className={`input-label ${errors.address ? 'text-error' : ''}`}>
                    Address {errors.address && errors.address?.type === 'required' ? t('inputError.required') : ''}
                    {errors.address && errors.address?.type === 'validate' ? t('inputError.invalid') : ''}
                  </label>
                  <input
                    id='address'
                    type='text'
                    className={clsx('input-form', errors.address && 'error')}
                    placeholder='Type here..'
                    {...register('address', { required: true })}
                  />
                </div>

                <div className={styles.height20} />
                <div className={styles.networkAndMemoWrap}>
                  <div className={styles.networkWrap}>
                    <label
                      htmlFor='network'
                      className={`${styles.labelDropdown} ${errors.network ? 'text-error' : ''}`}
                    >
                      Choose Network
                      {errors.network && errors.network?.type === 'required' ? t('inputError.required') : ''}
                      {errors.network && errors.network?.type === 'validate' ? t('inputError.invalid') : ''}
                    </label>
                    <CommonDropdown
                      data={availableNetworks}
                      itemComponent={itemComponentAddresses}
                      setSelectedData={setSelectedNetwork}
                      selectedData={selectedNetwork}
                    />
                  </div>

                  <div className='input-item-wrap-new'>
                    <label
                      style={{ display: 'flex', alignItems: 'center' }}
                      htmlFor='memo'
                      className={`input-label ${errors.memo ? 'text-error' : ''}`}
                    >
                      MEMO
                      <HintMemo />
                    </label>
                    <input
                      id='memo'
                      type='text'
                      className='input-form'
                      placeholder='Type here..'
                      {...register('memo')}
                    />
                  </div>
                </div>
              </form>
            </div>
          ) : null}

          {step === STEPS.SUMMARY && !response ? (
            <div>
              <div className={styles.title}>{updatedAddress ? 'Update Address' : 'Add New Address'}</div>
              <div className={styles.summaryContainer}>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryText}>Address:</div>
                  <div className={styles.summarySubText}>{watchAddress}</div>
                </div>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryText}>Network:</div>
                  <div className={styles.summarySubText}>{selectedNetwork}</div>
                </div>
                {watchMemo ? (
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>Memo Tag:</div>
                    <div className={styles.summarySubText}>{watchMemo}</div>
                  </div>
                ) : null}
                <div className={styles.summaryRow}>
                  <div className={styles.summaryText}>Address Name:</div>
                  <div className={styles.summarySubText}>{watchAddressName}</div>
                </div>
              </div>
            </div>
          ) : null}

          {!response && step !== STEPS.WARNING ? (
            <div className={styles.btnGroup}>
              {step === STEPS.SUMMARY ? (
                <div className={styles.btnBackWrap}>
                  <button onClick={handleBackButton} className='btn-new grey big'>
                    {isLoading ? (
                      <span className='spinner-border' />
                    ) : (
                      <>
                        <div style={{ height: 16, marginRight: 6, width: 16 }}>
                          <TriangleIcon fill={'var(--Deep-Space)'} />
                        </div>
                        <div>Step Back</div>
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              <div className={styles.btnNextWrap}>
                <button
                  disabled={isLoading || isDisabled()}
                  className='btn-new primary big'
                  onClick={handleSubmit(handleNext)}
                >
                  {isLoading ? <span className='spinner-border' /> : btnName()}
                </button>
              </div>
            </div>
          ) : null}

          {response ? (
            <div>
              <div className={clsx(styles.title, styles.mb16)}>
                {updatedAddress ? 'Update Address' : 'Add to Whitelist'}
              </div>
              <StepControllerComponent
                nextStepResponse={response}
                finalAction={handleFinalAction}
                dataProps={{ resetStepUp: () => setResponse(null) }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
