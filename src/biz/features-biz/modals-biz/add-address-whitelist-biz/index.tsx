import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { pages } from 'constant'
import { $twoFaStatus } from 'model/two-fa'

import { Modal } from '../../../../components'
import { STEP_UP_SCOPE } from '../../../../constant/step-up-scope'
import { StepControllerComponent } from '../../../../features/step-controller'
import { $assetsListData, CombinedObject } from '../../../../model/cefi-combain-assets-data'
import { getWhiteListFx } from '../../../../model/white-list'
import { validateAddress } from '../../../../utils'
import { validateStepUpAvailability } from '../../../../utils/validate-step-up-availability'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from '../../../../wip/services'
import { WhitListServices } from '../../../../wip/services/white-list'
import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from '../confirmation-modal-biz'
import styles from './styles.module.scss'
import { ACCOUNT_PAGES } from 'biz/features-biz/account-settings'
import { WhitelistFormBiz } from 'biz/features-biz/whitelist-form-biz'

type Inputs = {
  address: string
  memo: string
  addressLabel: string
}

const defaultValues = {
  address: '',
  memo: '',
  addressLabel: '',
}

type Props = {
  addressData: {
    asset: CombinedObject
    address: string
    networkId: string
    memo: string
    setIsShowAddressBook: React.Dispatch<React.SetStateAction<boolean>>
    setIsAddWhitelist: React.Dispatch<React.SetStateAction<boolean>>
  }
}

// TODO: Дать понятное название (это обертка для формы по добавлению вайтлиста из флоу Send Crypto).
export function AddAddressWhitelistBiz({ addressData }: Props) {
  const navigate = useNavigate()
  const assets = useUnit($assetsListData)
  const twoFaStatus = useUnit($twoFaStatus)

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = methods

  const watchAddress = watch('address')
  const watchMemo = watch('memo')
  const watchAddressName = watch('addressLabel')

  const [isLoading, setIsLoading] = useState(false)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(addressData.networkId || null)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isSuccessful, setIsSuccessful] = useState(false)

  useEffect(() => {
    setValue('address', addressData.address)
    setValue('memo', addressData.memo)
  }, [addressData])

  const handleAddAddress = async () => {
    if (!twoFaStatus) {
      Modal.open(
        <ConfirmationModalBiz
          options={CONFIRMATION_MODAL_OPTIONS.enable2FAPrompt}
          action={() => {
            navigate(pages.ACCOUNT_SETTINGS.path, { state: { currentPage: ACCOUNT_PAGES.SECURITY } })
            Modal.close()
          }}
        />,
        { variant: 'center' }
      )

      return
    }

    setIsLoading(true)
    try {
      const isValidAddress = selectedNetworkId ? await validateAddress(watchAddress, selectedNetworkId) : ''
      if (!isValidAddress) {
        setError('address', {
          type: 'validate',
          message: 'Invalid',
        })
        setIsLoading(false)
        return
      }

      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      console.log('ERROR-handleAddAddress', error)
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    try {
      await WhitListServices.addAddressWhitelist(
        {
          name: watchAddressName,
          networkId: selectedNetworkId || '',
          address: watchAddress,
          tag: watchMemo,
        },
        (responseData as StepUpAuthResponse).oneTimeAccessToken
      )
      await getWhiteListFx()

      setIsSuccessful(true)
      addressData.setIsAddWhitelist(false)
    } catch (error: any) {
      console.log('ERROR-addAddressWhitelist', error)
    }
  }

  const handleClose = () => {
    addressData.setIsShowAddressBook(false)
    Modal.close()
  }

  if (isSuccessful) {
    return (
      <div className={styles.containerModal} style={{ height: 300 }}>
        <div className={styles.textTitle}>Add Address to&nbsp;Whitelist</div>
        <div className={styles.textDescription}>
          You can now use it for secure withdrawals and continue sending crypto to this whitelisted address.
        </div>

        <button className='btn-biz blue' style={{ height: 50, marginTop: 60 }} onClick={handleClose}>
          Continue Withdrawal
        </button>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form className={styles.containerModal} onSubmit={handleSubmit(handleAddAddress)}>
        {!response && (
          <>
            <div className={styles.textTitle}>Add Address to&nbsp;Whitelist</div>
            <div className={styles.textDescription}>
              You can now use it for secure withdrawals and continue sending crypto to this whitelisted address.
            </div>
            <div style={{ height: 34 }} />

            <WhitelistFormBiz
              isLoading={isLoading}
              methods={methods}
              selectedNetworkId={selectedNetworkId}
              setSelectedNetworkId={setSelectedNetworkId}
              availableNetworksId={[addressData.networkId]}
            />

            <div style={{ minHeight: 64 }} />
            <button disabled={isLoading} type='submit' className='btn-biz blue' style={{ minHeight: 35 }}>
              {isLoading ? <span className='spinner-border' /> : 'Save'}
            </button>
          </>
        )}
        {response && ( //TODO add wrapper
          <>
            <div className={styles.textTitle}>Add Address to&nbsp;Whitelist</div>
            <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />
          </>
        )}
      </form>
    </FormProvider>
  )
}
