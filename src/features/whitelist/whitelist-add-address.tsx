import { MutableRefObject, ReactElement, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { BackButton, CommonDropdown, Modal, Success } from 'components'
import i18n from 'components/i18n/localize'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { TwoFaSetup } from 'features/modals'
import { StepControllerComponent } from 'features/step-controller'
import { handleError } from 'utils/error-handler'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import { $twoFaStatus } from 'model/two-fa'

import { HintMemo } from '../../components/hint-memo'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $whiteList, getWhiteListFx } from '../../model/white-list'
import { validateAddress } from '../../utils'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from '../../wip/services'
import { WhitListServices } from '../../wip/services/white-list'
import { ModalCloseRef } from './index'
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

type Props = {
  id?: string
  modalCloseRef?: MutableRefObject<ModalCloseRef | null>
}

export const WhitelistAddAddress = ({ id, modalCloseRef }: Props) => {
  const navigate = useNavigate()
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
  const { t } = i18n
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
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(availableNetworks[0])
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

  const handleCloseModal = () => {
    if (step === STEPS.SUMMARY) {
      setStep(STEPS.WARNING)
    } else {
      Modal.close()
    }
  }

  useEffect(() => {
    if (modalCloseRef) {
      modalCloseRef.current = { action: handleCloseModal }
    }
  }, [step])

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

  const itemComponentAddresses = (selectedItem: string): ReactElement => {
    return (
      <div>
        <div style={{ marginLeft: '20px' }}>{selectedItem}</div>
      </div>
    )
  }

  const btnName = () => {
    if (step === STEPS.SUMMARY && updatedAddress) return 'Update'
    if (step === STEPS.SUMMARY) return 'Confirm & Add to Whitelist'
    return 'Next'
  }

  const isDisabled = () => {
    return !!foundWhiteAddress
  }

  const successfulName = 'Address Added\n to Whitelist Successfully'
  const successfulNameUpdated = 'Address Updated\n Successfully'

  if (isSuccessful) {
    return (
      <div className={styles.containerModal} style={{ padding: 0 }}>
        <Success text={updatedAddress ? successfulNameUpdated : successfulName} />
      </div>
    )
  }

  if (!twoFaStatus) {
    return (
      <div className={styles.mfaContainerModal}>
        <div className={styles.mfaTitle}>Two Factor Authentication</div>
        <div className={styles.mfaDescription}>
          For security reasons, a 2FA setup is required. Please follow the instructions.
        </div>
        <div className={styles.flexGrow1} />
        <button
          onClick={() => {
            Modal.open(<TwoFaSetup />, {
              title: pages.SETTINGS.name,
              isFullScreen: true,
            })
          }}
          className='btn-new primary'
        >
          Go to Settings
        </button>
      </div>
    )
  }

  return (
    <div className={styles.bigModalContainer}>
      {step === STEPS.ADD && !response ? (
        <div className={styles.bigModalContent}>
          <form style={{ position: 'relative' }} onSubmit={handleSubmit(handleNext)}>
            <div className={styles.bigModalTitle}>{updatedAddress ? 'Update Whitelist' : 'Add to Whitelist'}</div>
            <div className='input-item-wrap-new'>
              <label htmlFor='address' className={`input-label ${errors.address ? 'text-error' : ''}`}>
                Enter Wallet Address{' '}
                {errors.address && errors.address?.type === 'required' ? t('inputError.required') : ''}
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

            <div style={{ height: '1.5rem' }}></div>
            <label htmlFor='network' className={`${styles.labelDropdown} ${errors.network ? 'text-error' : ''}`}>
              Choose Network
              {errors.network && errors.network?.type === 'required' ? t('inputError.required') : ''}
              {errors.network && errors.network?.type === 'validate' ? t('inputError.invalid') : ''}
            </label>
            <div style={{ height: 8 }} />
            <CommonDropdown
              data={availableNetworks}
              itemComponent={itemComponentAddresses}
              setSelectedData={setSelectedNetwork}
              selectedData={selectedNetwork}
            />

            <div style={{ height: '1.5rem' }}></div>
            <div className='input-item-wrap-new'>
              <label
                style={{ display: 'flex', alignItems: 'center' }}
                htmlFor='memo'
                className={`input-label ${errors.memo ? 'text-error' : ''}`}
              >
                MEMO
                <HintMemo />
              </label>
              <input id='memo' type='text' className='input-form' placeholder='Type here..' {...register('memo')} />
            </div>

            <div style={{ height: '1.5rem' }}></div>
            <div className='input-item-wrap-new'>
              <label htmlFor='addressName' className={`input-label ${errors.addressName ? 'text-error' : ''}`}>
                Enter Address Name{' '}
                {errors.addressName && errors.addressName?.type === 'required' ? t('inputError.required') : ''}
                {errors.addressName && errors.addressName?.type === 'validate' ? t('inputError.invalid') : ''}
              </label>
              <input
                id='addressName'
                type='text'
                className={clsx('input-form', errors.address && 'error')}
                placeholder='Type here..'
                {...register('addressName', { required: true })}
              />
            </div>
            <div style={{ height: '2rem' }}></div>
          </form>
        </div>
      ) : null}

      {step === STEPS.SUMMARY && !response ? (
        <>
          <BackButton backFn={handleBackButton} />
          <div className={styles.bigModalContent}>
            <div>
              <div className={styles.bigModalTitle}>{updatedAddress ? 'Update Whitelist' : 'Add to Whitelist'}</div>
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
          </div>
        </>
      ) : null}

      {!response && step !== STEPS.WARNING ? (
        <button disabled={isLoading || isDisabled()} className='btn-new primary big' onClick={handleSubmit(handleNext)}>
          {isLoading ? <span className='spinner-border' /> : btnName()}
        </button>
      ) : null}

      {step === STEPS.WARNING && !response ? (
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
            <button className={'btn-new red'} onClick={() => Modal.close()}>
              Close Without Changes
            </button>

            <button className={'btn-new transparent'} onClick={() => setStep(STEPS.ADD)}>
              Return to Update
            </button>
          </div>
        </div>
      ) : null}

      {response ? (
        <>
          <div className={styles.bigModalTitle}>{updatedAddress ? 'Update Whitelist' : 'Add to Whitelist'}</div>
          <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />
        </>
      ) : null}
    </div>
  )
}
