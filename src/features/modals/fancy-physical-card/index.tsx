import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CompleteIconBlur, Spinner } from 'components'
import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { StepBackBtn } from 'components/step-back-btn'
import { pages } from 'constant'
import { CardDispatchResponse, CardFeesResponse, CardService } from 'wip/services'
import { getCardsDataFx } from 'model/cefi-banking'
import backArrow from 'assets/icons/back-arrow.svg'

import styles from './styles.module.scss'

const STEPS = {
  DELIVERY_ADDRESS: 'Delivery',
  DELIVERY_METHOD: 'Delivery Method',
  SUMMARY: 'Summary',
}

export function FancyPhysicalCard() {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(STEPS.DELIVERY_ADDRESS)
  const [deliveryData, setDeliveryData] = useState<CardDispatchResponse | null>(null)
  const [selectedData, setSelectedData] = useState<any>({
    method: 'placeholder',
    description: '',
    price: '',
  })
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [requestError, setRequestError] = useState('')

  const [feesInfo, setFeesInfo] = useState<CardFeesResponse[]>([])

  const handlePhysical = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const address = await CardService.getDispatchAddress()
      const delivery = await CardService.getDelivery(address.countryCode)

      // // MOCK
      // const address = {
      //   address1: 'address1',
      //   address2: 'address2',
      //   city: 'city',
      //   countryCode: 'LTU',
      //   postalCode: 'postalCode',
      // }
      //
      // const delivery = [
      //   {
      //     method: 'DHL_EXPRESS',
      //     description: 'description-DHL_EXPRESS',
      //     price: 34,
      //   },
      //   {
      //     method: 'DHL_GLOBAL_MAIL',
      //     description: 'description-DHL_GLOBAL_MAIL',
      //     price: 56,
      //   },
      // ] as DispatchMethod[]

      setDeliveryData({
        dispatchMethods: delivery,
        deliveryAddress: address,
      })
    } catch (e: any) {
      console.log('ERROR-handlePhysical', e)
      setRequestError(e.code || e.message)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    handlePhysical()
  }, [])

  const itemComponentCurrency = (item: any) => {
    if (item.method === 'placeholder') {
      return <div className={styles.itemTextPlaceholder}>Choose from the list</div>
    }

    return (
      <div className={styles.itemText}>
        <div className={styles.itemTextTitle}>{item.method.replaceAll('_', ' ')}</div>
        <div className={styles.itemTextDescription}>
          {item.description} <span className={styles.itemTextAmount}>{item.price ? ` €${item.price}` : ''}</span>
        </div>
      </div>
    )
  }

  const disableBtn = (): boolean => {
    if (isLoading) return true
    return selectedData.method === 'placeholder'
  }

  const handleDelivery = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await CardService.setPhysicalCardRequested(selectedData.method)
      await getCardsDataFx()
      setIsSuccessful(true)
    } catch (e: any) {
      console.log('ERROR-handlePhysical', e)
      setRequestError(e.code || e.message)
    }
    setIsLoading(false)
  }

  const getCardIssuanceFeeInfoFetch = async () => {
    setIsLoading(true)
    try {
      const feeInfoResponse = await CardService.getCardIssuanceFeeInfo('CHIPANDPIN', selectedData.method)
      setFeesInfo(feeInfoResponse)
    } catch (error: any) {
      setRequestError(error.code || error.message || 'FEE INFO Error')
      console.log('getCardIssuanceFeeInfo-ERROR', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (step === STEPS.DELIVERY_ADDRESS) {
      setStep(STEPS.DELIVERY_METHOD)
    }
    if (step === STEPS.DELIVERY_METHOD) {
      getCardIssuanceFeeInfoFetch()
      setStep(STEPS.SUMMARY)
    }
  }

  const handleBack = () => {
    requestError && setRequestError('')
    if (step === STEPS.SUMMARY) {
      setStep(STEPS.DELIVERY_METHOD)
    }
    if (step === STEPS.DELIVERY_METHOD) {
      setStep(STEPS.DELIVERY_ADDRESS)
    }
  }

  const deliveryFee = feesInfo.find(
    fee => fee.type === 'CardExpressDeliveryFixedFee' || fee.type === 'CardDeliveryFixedFee'
  )?.fixedPart

  const issuanceFee = feesInfo.find(fee => fee.type === 'CardIssuanceFixedFee')?.fixedPart

  if (isSuccessful) {
    return (
      <div style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
        <div className={styles.isSuccessIconWrap}>
          <CompleteIconBlur isMobile={false} />
        </div>
        <div className={styles.title}>{'Congrats!\nYour card order is submitted.'}</div>
        <div style={{ height: 10 }} />
        <div className={styles.description}>{'We are processing your card order.'}</div>

        <div style={{ height: 69 }} />

        <button onClick={() => navigate(pages.CARD.path)} className='btn-new transparent big'>
          <img alt='icon' src={backArrow} style={{ marginRight: 10 }} />
          Go Back to Card
        </button>
      </div>
    )
  }

  return (
    <div className={styles.topUpCardWrap}>
      {step === STEPS.DELIVERY_ADDRESS && !isLoading ? (
        <div className={styles.sectionAddress}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 100 }}>
            <div className={styles.header}>
              <div className={styles.title}>Physical Card Order</div>
              <div className={styles.description}>
                To place an order of a physical card, please confirm shipping address. If you notice any mistakes,
                please contact support immediately.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryLabel}>Delivery address</div>
              <div className={styles.summaryText}>
                {[
                  deliveryData?.deliveryAddress?.address1,
                  deliveryData?.deliveryAddress?.address2,
                  deliveryData?.deliveryAddress?.city,
                  deliveryData?.deliveryAddress?.countryCode,
                  deliveryData?.deliveryAddress?.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          </div>

          <button type='button' className='btn-new primary big' onClick={handleNext}>
            {isLoading ? <span className='spinner-border' /> : 'Confirm & Continue'}
          </button>
        </div>
      ) : null}

      {step === STEPS.DELIVERY_METHOD && !isLoading ? (
        <div className={styles.section}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <div className={styles.header}>
              <div className={styles.title}>Delivery Method</div>
              <div className={styles.description}>
                Choose your preferred option. Prices exclude discounts;
                <br /> final pricing appears on the next screen.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.countryDropDownWrap}>
                <CommonDropdownBiz
                  data={deliveryData?.dispatchMethods || []}
                  itemComponent={itemComponentCurrency}
                  setSelectedData={setSelectedData}
                  selectedData={selectedData}
                />
              </div>
            </div>
          </div>

          <div className={styles.height100} />

          <div className={styles.btnsGroupDeliveryMethod}>
            <StepBackBtn isLoading={isLoading} backButtonFn={handleBack} />
            <button type='button' className='btn-new primary big' disabled={disableBtn()} onClick={handleNext}>
              {isLoading ? <span className='spinner-border' /> : 'Continue'}
            </button>
          </div>
        </div>
      ) : null}

      {step === STEPS.SUMMARY && !isLoading ? (
        <div className={styles.section}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
            <div className={styles.header}>
              <div className={styles.title}>Card Order Summary</div>
              <div className={styles.description}>Make sure the following information is correct.</div>
            </div>

            <div className={styles.summaryContent}>
              {deliveryData ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className={styles.summaryLabel}>Delivery address</div>
                  <div className={styles.summaryText}>
                    {[
                      deliveryData.deliveryAddress?.address1,
                      deliveryData.deliveryAddress?.address2,
                      deliveryData.deliveryAddress?.city,
                      deliveryData.deliveryAddress?.countryCode,
                      deliveryData.deliveryAddress?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={styles.summaryLabel}>Card</div>
                <div className={styles.summaryText}>Pairs Physical HODL Card</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={styles.summaryLabel}>Plastic Card Issuance Fee</div>
                <div className={styles.summaryText}>€{issuanceFee !== undefined ? issuanceFee : ''}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className={styles.summaryLabel}>Card Delivery Fee</div>
                  <div className={styles.lineThroughP10}>€{selectedData.price}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className={styles.tierDiscountText}>(Tier Discount Applied)</div>
                  <div className={styles.summaryTextPrimary}>€{deliveryFee !== undefined ? deliveryFee : ''}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 100 }}>
            <StepBackBtn isLoading={isLoading} backButtonFn={handleBack} />
            <button
              type='submit'
              className='btn-new primary big'
              disabled={disableBtn()}
              onClick={() => handleDelivery()}
            >
              {isLoading ? <span className='spinner-border' /> : 'Confirm & Order'}
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className='justify-row-center'>
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}
