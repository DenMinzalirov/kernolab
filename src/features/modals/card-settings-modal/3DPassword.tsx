import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal, RequestError, Spinner } from 'components'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'

import { pages } from '../../../constant'
import { $twoFaStatus } from '../../../model/two-fa'
import {
  AuthResponse,
  CardService,
  EncryptedCard3DPassword,
  EncryptedCardPin,
  MFAAddAuthResponse,
  StepUpAuthResponse,
} from '../../../wip/services'
import { StepControllerComponent } from '../../step-controller'
import { decryptedData, generateKeyPair, getPublicKeyPem, preparedEncrypt } from '../card-view-details/cryptoHelpers'
import styles from './styles.module.scss'

type Props = {
  isPin?: boolean
  cardUuid: string
}
//TODO DELETE
const Password: React.FC<Props> = ({ isPin, cardUuid }) => {
  const twoFaStatus = useUnit($twoFaStatus)

  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [card3DSecurePassword, setCard3DSecurePassword] = useState('')
  const [response, setResponse] = useState<AuthResponse | MFAAddAuthResponse | StepUpAuthResponse | null>(null)

  const navigate = useNavigate()

  const getCardsData = async (responseData: AuthResponse | MFAAddAuthResponse | StepUpAuthResponse): Promise<void> => {
    setIsLoading(true)
    try {
      const { privateKey, publicKey } = await generateKeyPair()

      const publicKeyPem = await getPublicKeyPem(publicKey)
      const base64PublicKey = window.btoa(publicKeyPem)

      const service = isPin ? CardService.getCardPin : CardService.getCard3DPassword

      const cardDetails = await service({
        cardUuid,
        publicKey: base64PublicKey,
        token: (responseData as StepUpAuthResponse)?.oneTimeAccessToken,
      })

      const label = isPin ? 'PIN' : 'Card3DSecurePassword'
      if (isPin) {
        const encryptedCardPin = preparedEncrypt((cardDetails as EncryptedCardPin).encryptedCardPin)
        const cardPin = await decryptedData(privateKey, encryptedCardPin, label)
        setCard3DSecurePassword(cardPin)
      } else {
        const encryptedCard3DPassword = preparedEncrypt(
          (cardDetails as EncryptedCard3DPassword).encryptedCard3DPassword
        )
        const card3DPassword = await decryptedData(privateKey, encryptedCard3DPassword, label)
        setCard3DSecurePassword(card3DPassword)
      }
    } catch (e: any) {
      console.log('ERROR-TwoFactorAuthenticationModal', e)
      setRequestError(e.code || e.message)
    }
    setResponse(null)
    setIsLoading(false)
  }

  const startViewDetails = async () => {
    try {
      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.CARD_DATA)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      console.log('startViewDetails-ERROR', error)
      setRequestError(error.code)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    twoFaStatus &&
      startViewDetails().catch(e => {
        console.log('ERROR-cryptoFlow', e)
      })
  }, [])

  if (!twoFaStatus) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        <div className={styles.title}>Two Factor Authentication</div>
        <div style={{ flexGrow: 1 }} />
        <div className={styles.description} style={{ maxWidth: 440, textAlign: 'center' }}>
          For security reasons, a 2FA setup is required. Please follow the instructions.
        </div>
        <div style={{ flexGrow: 1 }} />
        <button
          onClick={() => {
            navigate(pages.SETTINGS.path)
            Modal.close()
          }}
          className='btn-new primary big'
          style={{ maxWidth: 440 }}
        >
          Go to Settings
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
      }}
    >
      <div className={styles.title}>
        <div>{isPin ? 'PIN Code' : '3DS Password'}</div>
      </div>

      {/*{isLoading ? (*/}
      {/*  <div className={styles.title}>*/}
      {/*    <Spinner />*/}
      {/*  </div>*/}
      {/*) : null}*/}
      {card3DSecurePassword ? (
        <div className={styles.title} style={{ alignSelf: 'center' }}>
          {card3DSecurePassword}
        </div>
      ) : null}
      {response && <StepControllerComponent nextStepResponse={response} finalAction={getCardsData} />}
      {requestError ? <RequestError requestError={requestError} /> : null}
    </div>
  )
}
