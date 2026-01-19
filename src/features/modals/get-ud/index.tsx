import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import { FpjsClient } from '@fingerprintjs/fingerprintjs-pro-react'

import { CompleteIconBlur, RequestError } from 'components'
import i18n from 'components/i18n/localize'
import {
  AssetsServices,
  fpUrl,
  getDomainsSuggestions,
  getFpKeyUd,
  getOrderUd,
  resellerFreeID,
  SuggestionsDomains,
  supportedNetworksFree,
  walletAddressUD,
} from 'wip/services'
import { $isMobile } from 'model'

import { $assetsListData } from '../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

type Inputs = {
  domainName: string
}

const defaultValues = {
  domainName: '',
}

//TODO Deprecate ?

export function GetUDModal() {
  const assets = useUnit($assetsListData)

  const { t } = i18n

  const isMobile = useUnit($isMobile)

  const methods = useForm<Inputs>({ defaultValues })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resultList, setResultList] = useState<SuggestionsDomains[]>([])
  const [selectedDomain, setSelectedDomain] = useState<SuggestionsDomains | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // useEffect(() => {
  //   if (!userEmail) {
  //     getUserEmailFx()
  //   }
  // }, [userEmail])

  // const getDepositDataAssetsCeFi = async () => {
  //   const depositInfoArr = []
  //
  //   for (const asset of assets) {
  //     if (!supportedNetworksFree.includes(asset.assetId)) continue
  //     try {
  //       const depositInfo = await AssetsServices.getDepositInfo(asset.assetId)
  //       depositInfoArr.push(...depositInfo)
  //     } catch (e) {
  //       console.log('ERROR get DepositInfo', e)
  //     }
  //   }
  //
  //   for (const depositInfoItem of depositInfoArr) {
  //     if (!depositInfoItem.depositAddress) {
  //       try {
  //         const depositAddress = await AssetsServices.createDepositAddress(
  //           depositInfoItem.assetId,
  //           depositInfoItem.networkId
  //         )
  //         depositInfoItem.depositAddress = depositAddress.depositAddress
  //       } catch (e) {
  //         console.log('ERROR set depositAddress', e)
  //       }
  //     }
  //   }
  //
  //   const depositData: Record<string, string> = {}
  //
  //   depositInfoArr
  //     .filter(asset => asset.depositAddress)
  //     .forEach(asset => {
  //       if (asset.networkId && asset.depositAddress) {
  //         const networkId = asset.networkId.replace('BSC', 'BNB')
  //         depositData[`crypto.${networkId}.address`] = asset.depositAddress
  //
  //         if (networkId === 'MATIC') {
  //           depositData[`crypto.MATIC.version.ERC20.address`] = asset.depositAddress
  //           depositData[`crypto.MATIC.version.MATIC.address`] = asset.depositAddress
  //         }
  //       }
  //     })
  //   return depositData
  // }

  const onSubmit: SubmitHandler<Inputs> = async data => {
    // setErrorMessage('')
    // setIsLoading(true)
    // try {
    //   if (selectedDomain) {
    //     const keyDataUdFp = await getFpKeyUd()
    //     const FingerprintJSClient = new FpjsClient({
    //       loadOptions: { apiKey: keyDataUdFp.key, endpoint: fpUrl },
    //     })
    //     await FingerprintJSClient.init()
    //     const visitorData = await FingerprintJSClient.getVisitorData({ linkedId: resellerFreeID })
    //
    //     const address = await walletAddressUD()
    //     const resolution = await getDepositDataAssetsCeFi()
    //
    //     const body = {
    //       payment: {
    //         method: 'free',
    //       },
    //       security: [
    //         {
    //           type: 'fingerprintjs',
    //           identifier: visitorData.visitorId,
    //         },
    //       ],
    //       domains: [
    //         {
    //           name: selectedDomain.name, // domain name you are minting
    //           ownerAddress: address.walletAddress, // wallet address to mint the domain to
    //           email: userEmail, // UD email address to link the domain to
    //           resolution, // predefined records to mint the domain with
    //         },
    //       ],
    //     }
    //
    //     await getOrderUd(body)
    //
    //     setIsSuccess(true)
    //   } else {
    //     const result = await getDomainsSuggestions(data.domainName)
    //     setResultList(result)
    //   }
    // } catch (e: any) {
    //   console.log('ERROR-getDomains', e)
    //   setErrorMessage(e.code || 'ERROR')
    // }
    // setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: -50,
          }}
        >
          <div style={{ marginBottom: 79, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CompleteIconBlur isMobile={isMobile} />
          </div>
          <div className={styles.completedText}>
            WEB3 Domain <br />
            Purchase Successful
          </div>
          <div className={styles.completedText2}>Please allow 15 minutes for the domain to be visible.</div>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.container}>
          <div className={styles.title}>{selectedDomain ? 'Summary' : 'Get a Free WEB3 Domain'}</div>
          {!selectedDomain && (
            <div className={clsx('input-item-wrap', styles.inputWrap)}>
              <label htmlFor='domainName' className={`input-label ${errors.domainName ? 'text-error' : ''}`}>
                Search Domain{' '}
                {errors.domainName && errors.domainName.type === 'required' ? t('inputError.required') : ''}
              </label>
              <input
                id='domainName'
                type='text'
                className='input-form'
                style={errors.domainName ? { border: '1px solid red' } : {}}
                placeholder='Enter domain name to search'
                {...register('domainName', {
                  required: true,
                })}
              />
            </div>
          )}

          <div className={styles.resultSection}>
            {!selectedDomain && resultList.length > 0 && (
              <>
                <div className={styles.resultTitle}>Available Domains</div>
                <div className={styles.resultList}>
                  {resultList.map(item => {
                    return (
                      <div key={item.name} onClick={() => setSelectedDomain(item)} className={styles.resultItem}>
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {selectedDomain && (
              <div>
                <div className={styles.summaryTitle}>Selected Domain</div>
                <div className={styles.summaryData}>{selectedDomain.name}</div>
                <div style={{ width: '100%', borderTop: '1px solid rgba(38, 40, 50, 0.1)', margin: '25px 0' }} />
                <div className={styles.summaryTitle}>Price</div>
                <div className={styles.summaryData}>{selectedDomain.price} USD</div>
              </div>
            )}
          </div>

          <button type='submit' className='btn btn-primary' disabled={isLoading} style={{ maxWidth: 440 }}>
            {isLoading ? <span className='spinner-border' /> : selectedDomain ? 'Buy Domain' : 'Search Domain'}
          </button>

          {selectedDomain && (
            <button
              className={clsx('btn', 'btn-primary', styles.backBtn)}
              onClick={e => {
                e.preventDefault()
                setSelectedDomain(null)
                setErrorMessage('')
              }}
            >
              Back
            </button>
          )}

          <div className={styles.submitBtn} />

          {errorMessage && <RequestError requestError={errorMessage} />}
        </div>
      </form>
    </FormProvider>
  )
}
