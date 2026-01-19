import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { HeaderTitle, Modal, Spinner } from 'components'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { Card3DPasswordModal } from 'features/modals/card-3D-password-modal'
import {
  decryptedData,
  generateKeyPair,
  getPublicKeyPem,
  preparedEncrypt,
} from 'features/modals/card-view-details/cryptoHelpers'
import { TwoFaRequiredModal } from 'features/modals/two-fa-required-modal'
import { StepControllerComponent } from 'features/step-controller'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import {
  AuthResponse,
  CardService,
  EncryptedCard3DPassword,
  EncryptedCardPin,
  MFAAddAuthResponse,
  StepUpAuthResponse,
} from 'wip/services'
import { $selectedCardUuid } from 'model/cefi-banking'
import { $twoFaStatus } from 'model/two-fa'

import styles from './styles.module.scss'

export function CardSecurity() {
  const navigate = useNavigate()
  const location = useLocation()
  const isPin = location?.state?.isPin || false

  const selectedCardUuid = useUnit($selectedCardUuid)

  const twoFaStatus = useUnit($twoFaStatus)

  const [isLoading, setIsLoading] = useState(true)
  const [card3DSecurePassword, setCard3DSecurePassword] = useState('')
  const [response, setResponse] = useState<AuthResponse | MFAAddAuthResponse | StepUpAuthResponse | null>(null)

  const getCardsData = async (responseData: AuthResponse | MFAAddAuthResponse | StepUpAuthResponse): Promise<void> => {
    if (!selectedCardUuid) return

    setResponse(null)
    setIsLoading(true)
    try {
      const { privateKey, publicKey } = await generateKeyPair()

      const publicKeyPem = await getPublicKeyPem(publicKey)
      const base64PublicKey = window.btoa(publicKeyPem)

      const service = isPin ? CardService.getCardPin : CardService.getCard3DPassword

      const cardDetails = await service({
        cardUuid: selectedCardUuid,
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
      // MOCK: Для внутреннего тестирования и разработки
      const mockPassword = isPin ? '1234' : 'ABC123XYZ'
      setCard3DSecurePassword(mockPassword)
      setResponse(null)
    }
    setIsLoading(false)
  }

  const startViewDetails = async () => {
    try {
      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.CARD_DATA)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      console.log('startViewDetails-ERROR', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedCardUuid) {
      navigate(pages.CARD.path)
      return
    }

    if (twoFaStatus) {
      startViewDetails().catch(e => {
        console.log('ERROR-cryptoFlow', e)
      })
    }

    if (!twoFaStatus) {
      Modal.open(<TwoFaRequiredModal />, {
        variant: 'center',
        customCloseModal: () => {
          navigate(-1)
          Modal.close()
        },
      })
    }
  }, [])

  useEffect(() => {
    if (card3DSecurePassword) {
      Modal.open(<Card3DPasswordModal value={card3DSecurePassword} />, {
        variant: 'center',
        customCloseModal: () => {
          navigate(pages.CARD.path)
          Modal.close()
        },
      })
    }
  }, [card3DSecurePassword])

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle='Settings' showBackBtn />

      <div className={styles.contentWrap}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <Spinner />
          </div>
        ) : null}

        {response && (
          <div className={styles.content}>
            <div className={styles.title}>{isPin ? 'PIN' : '3DS Password'}</div>
            <StepControllerComponent nextStepResponse={response} finalAction={getCardsData} />
          </div>
        )}
      </div>
    </div>
  )
}
