import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages } from 'constant'
import successfullyIcon from 'assets/icons/successfully-xenovo.svg'

import { Modal } from '../../../../components'
import { parseJwt, saveRefreshToken, saveToken } from '../../../../utils'
import { getRefreshToken } from '../../../../utils/local-storage'
import { AuthServiceV4 } from '../../../../wip/services'
import { CryptoTab } from './crypto-tab'
import { FiatTab } from './fiat-tab'
import styles from './styles.module.scss'

export function MembershipFormXanova() {
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'fiat'>('crypto')

  const tabs = [
    { id: 'crypto', label: 'Crypto', component: <CryptoTab /> },
    { id: 'fiat', label: 'Fiat', component: <FiatTab /> },
  ] as const

  const activeTab = tabs.find(tab => tab.id === selectedMethod)

  // Наблюдатель за изменением токена на сервере
  useEffect(() => {
    const checkTokenStatus = async () => {
      const rToken = getRefreshToken() || ''
      if (rToken) {
        try {
          const response = await AuthServiceV4.newTokensPair(rToken)
          const parsedToken = parseJwt(response.accessToken)
          const { scope } = parsedToken || {}
          if (scope && scope.includes('MEMBER')) {
            saveRefreshToken(response.refreshToken)
            saveToken(response.accessToken)
            Modal.open(
              <div className={styles.contentSuccess}>
                <img src={successfullyIcon} alt='success icon' className={styles.icon} />
                <div>
                  <div className={styles.titleAuth}>{'Your membership is now active.\nWelcome aboard!'}</div>
                  <div className={styles.subTitleAuth}>You now have full access to all features.</div>
                </div>
                <button
                  onClick={() => {
                    navigate(pages.Base.path)
                    Modal.close()
                  }}
                  className='btn-xanova big gold'
                >
                  Close
                </button>
              </div>,
              {
                customCloseModal: () => {
                  navigate(pages.Base.path)
                  Modal.close()
                },
                variant: 'center',
                noClose: true,
              }
            )
          }
        } catch (error) {
          console.error('ERROR-checkTokenStatus', error)
        }
      }
    }

    // Проверяем каждые 30 секунд, первый вызов тоже через 30 секунд
    const intervalId = setInterval(() => {
      checkTokenStatus()
    }, 10000)

    // Очистка при размонтировании
    return () => {
      clearInterval(intervalId)
    }
  }, [navigate])

  return (
    <div className={styles.containerModal}>
      <h2 className={styles.title}>Select Deposit Method</h2>
      <div className={styles.line} />

      <div className={styles.tabsButtons} role='radiogroup' aria-label='Deposit method'>
        {tabs.map(tab => (
          <label key={tab.id} className={clsx('radio-wrap-xanova')} htmlFor={`deposit-method-${tab.id}`}>
            <input
              id={`deposit-method-${tab.id}`}
              type='radio'
              name='deposit-method'
              value={tab.id}
              checked={selectedMethod === tab.id}
              onChange={() => setSelectedMethod(tab.id)}
            />
            <span className='radio-xanova-box' />
            <span className='radio-xanova-text'>{tab.label}</span>
          </label>
        ))}
      </div>

      <div>{activeTab && activeTab.component}</div>
    </div>
  )
}
