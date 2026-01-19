import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Modal, Spinner } from 'components'
import { BankAddressResponse, FiatService, PageBankAddressResponse, StatusBankAddress } from 'wip/services'

import { pages } from '../../../constant'
import { WithdrawalFiat } from './fiat'
import { WithdrawalNotAvailable } from './not-available'
import styles from './styles.module.scss'

// Мок-данные для fallback
const mockBankAddresses: PageBankAddressResponse = {
  totalPages: 1,
  totalElements: 1,
  size: 10,
  content: [
    {
      addressUuid: 'mock-uuid-12345',
      iban: 'LT121000011101001000',
      name: 'SEB Bankas - Main Account',
      status: StatusBankAddress.APPROVED,
      bankIdentifier: 'CBVILT2X',
      operationType: 'SEPA',
    },
  ],
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  numberOfElements: 1,
  pageable: {
    offset: 0,
    sort: {
      empty: true,
      sorted: false,
      unsorted: true,
    },
    unpaged: false,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
  },
  first: true,
  last: true,
  empty: false,
}

export function WithdrawBankingModal() {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [bankAddresses, setBankAddresses] = useState<BankAddressResponse[]>([])

  const getBankAddress = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const address = await FiatService.getAllBankAddress()
      if (address?.content && address.content.length > 0) {
        setBankAddresses(address.content)
      } else {
        setBankAddresses(mockBankAddresses.content)
      }
    } catch (e) {
      console.log('getAllBankAddress-ERROR', e)
      setBankAddresses(mockBankAddresses.content)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getBankAddress().catch(e => console.log('getAllBankAddress-ERROR', e))
  }, [])

  return (
    <div className={styles.containerModal}>
      {isLoading ? (
        <div className='justify-row-center'>
          <Spinner />
        </div>
      ) : bankAddresses.length ? (
        <WithdrawalFiat bankAddresses={bankAddresses} />
      ) : null}
    </div>
  )
}
