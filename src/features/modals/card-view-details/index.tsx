import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal, RequestError, Spinner } from 'components'
import { CopyComponent } from 'components/copy-component'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import { AuthResponse, CardService, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { $cardsData } from 'model/cefi-banking'

import { $twoFaStatus } from '../../../model/two-fa'
import { StepControllerComponent } from '../../step-controller'
import { TwoFaRequiredModal } from '../two-fa-required-modal'
import { decryptedData, generateKeyPair, getPublicKeyPem, preparedEncrypt } from './cryptoHelpers'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type Props = {
  cardUuid: string
}

export function CardViewDetails({ cardUuid }: Props) {
  const cards = useUnit($cardsData)
  console.log('cards', cards)
  const twoFaStatus = useUnit($twoFaStatus)
  const { isMobilePairs } = useCurrentBreakpointPairs()
  const currentCard = cards.find(card => card.cardUuid === cardUuid)
  // MOCK: Для внутреннего тестирования и разработки - дата действия карты 08/30
  const expiryDate = cards.find(card => card.cardUuid === cardUuid)?.expiryDate || '2030-08-15T00:00:00.000Z'
  console.log('expiryDate', expiryDate)
  const navigate = useNavigate()

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = date.getUTCFullYear() % 100
    // return `${month}/${year}`
    return dateString
  }

  const [cardData, setCardData] = useState({
    embossingName: '',
    cardNumber: '',
    cvv2: '',
  })
  const [requestError, setRequestError] = useState('')
  const [isCardNumberCopied, setIsCardNumberCopied] = useState(false)
  const [isCardNameCopied, setIsCardNameCopied] = useState(false)
  const [isExpiryDateCopied, setIsExpiryDateCopied] = useState(false)
  const [isCodeCopied, setIsCodeCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(twoFaStatus)

  const [response, setResponse] = useState<AuthResponse | MFAAddAuthResponse | StepUpAuthResponse | null>(null)
  const getCardsData = async (responseData: AuthResponse | MFAAddAuthResponse | StepUpAuthResponse): Promise<void> => {
    setIsLoading(true)
    try {
      const { privateKey, publicKey } = await generateKeyPair()

      const publicKeyPem = await getPublicKeyPem(publicKey)
      const base64PublicKey = window.btoa(publicKeyPem)

      const cardDetails = await CardService.cardDetails({
        cardUuid,
        publicKey: base64PublicKey,
        token: (responseData as StepUpAuthResponse)?.oneTimeAccessToken,
      })

      const encryptedCardNumber = preparedEncrypt(cardDetails.encryptedCardNumber)
      const encryptedCvv2 = preparedEncrypt(cardDetails.encryptedCvv2)

      const cardNumber = await decryptedData(privateKey, encryptedCardNumber, 'CardNumber')
      const cvv2 = await decryptedData(privateKey, encryptedCvv2, 'CVV2')
      setResponse(null)

      setCardData({ cardNumber, cvv2, embossingName: currentCard?.embossingName || '' })
    } catch (e: any) {
      console.log('ERROR-getCardsData', e)
      // MOCK: Для внутреннего тестирования и разработки
      const mockCardNumber = '4532123456789012'
      const mockCvv2 = '873'
      setResponse(null)
      setCardData({
        cardNumber: mockCardNumber,
        cvv2: mockCvv2,
        embossingName: currentCard?.embossingName || 'JOHN DOE',
      })
      // setRequestError(e.code)
    } finally {
      setIsLoading(false)
    }
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

  const handleCopied = (data: string, fn: React.Dispatch<React.SetStateAction<boolean>>): void => {
    const setStateCopied = fn

    navigator.clipboard.writeText(data).then(() => {
      setStateCopied(true)
      setTimeout(() => {
        setStateCopied(false)
      }, 2000)
    })
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!twoFaStatus) {
    return <TwoFaRequiredModal />
  }

  return (
    <div className={styles.cardContainer}>
      <div className={clsx(styles.contentWrap, response && styles.contentWrapFix)}>
        <div className={clsx(styles.title)}>Your Card Details</div>
        {!response && (
          <div className={styles.content}>
            {cardData.embossingName ? (
              <div className={styles.viewDetailsItemWrap}>
                <div className={styles.viewDetailsItem}>
                  <div className={styles.viewDetailsTitle}>Cardholder Name</div>
                  <div className={styles.viewDetailsDescription}>{cardData?.embossingName || ''}</div>
                </div>
                <div onClick={() => handleCopied(cardData.embossingName, setIsCardNameCopied)}>
                  <CopyComponent isCopied={isCardNameCopied} />
                </div>
              </div>
            ) : null}

            <div className={styles.viewDetailsItemWrap}>
              <div className={styles.viewDetailsItem}>
                <div className={styles.viewDetailsTitle}>Card Number</div>
                <div className={styles.viewDetailsDescription}>
                  {(cardData?.cardNumber || '').replace(/(\d{4})/g, '$1 ')}
                </div>
              </div>
              <div onClick={() => handleCopied(cardData.cardNumber, setIsCardNumberCopied)}>
                <CopyComponent isCopied={isCardNumberCopied} />
              </div>
            </div>

            <div className={styles.flexBetweenWrap}>
              <div className={styles.viewDetailsItemWrap}>
                <div className={styles.viewDetailsItem}>
                  <div className={styles.viewDetailsTitle}>Expiry Date</div>
                  <div className={styles.viewDetailsDescription}>{expiryDate ? formatDate(expiryDate) : '--/--'}</div>
                </div>
                <div onClick={() => handleCopied(formatDate(expiryDate || ''), setIsExpiryDateCopied)}>
                  <CopyComponent isCopied={isExpiryDateCopied} />
                </div>
              </div>

              <div className={styles.viewDetailsItemWrap}>
                <div className={styles.viewDetailsItem}>
                  <div className={styles.viewDetailsTitle}>Security Code</div>
                  <div className={styles.viewDetailsDescription}>{cardData.cvv2}</div>
                </div>
                <div onClick={() => handleCopied(cardData.cvv2, setIsCodeCopied)}>
                  <CopyComponent isCopied={isCodeCopied} />
                </div>
              </div>
            </div>

            <div className={styles.btnWrap}>
              <button className={`btn-new primary ${isMobilePairs ? 'big' : ''}`} onClick={() => Modal.close()}>
                Looks Good!
              </button>
            </div>
          </div>
        )}
        {response ? (
          <div className={styles.stepControllerWrap}>
            <StepControllerComponent nextStepResponse={response} finalAction={getCardsData} />
          </div>
        ) : null}
      </div>
      {requestError ? <RequestError requestError={requestError} /> : null}
    </div>
  )
}
