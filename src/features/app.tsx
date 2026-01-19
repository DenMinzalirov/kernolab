import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { ErrorModal } from 'components/error-modal'
import { Layout } from 'features/layout'
import { Router } from 'router'
import { parseJwt, updateFavicon } from 'utils'
import { initApp } from 'wip/stores'
import { favicon, theme, themeValue } from 'config'
import { $authToken, fetchXanovaFormsFx, setIsMobileEV } from 'model'
import {
  $hasTravelRuleModalBeenShown,
  $travelRuleData,
  hasTravelRuleModalBeenShownEv,
} from 'model/travel-rule-transactions'

import { MainSnackbar } from '../components/main-snackbar'
import { mainLoaderChangedEv } from '../model/mainLoader'
import { getUserInfoFx } from '../model/user-info'
import { GlobalHistory } from '../router/global-history'
import { TravelRuleVerificationModal } from './modals/travel-rule-verification-modal'
import { disable as disableDarkMode, enable as enableDarkMode } from 'darkreader'

export function App() {
  const mediaQueryList = window.matchMedia('(max-width: 767px)')
  const hasTravelRuleModalBeenShown = useUnit($hasTravelRuleModalBeenShown)
  const travelRuleData = useUnit($travelRuleData)
  const userToken = useUnit($authToken)

  if (theme === themeValue.fideumOTC) {
    enableDarkMode({
      brightness: 100,
      contrast: 90,
      sepia: 10,
    })
  }

  const handleChange = (mq: MediaQueryListEvent | MediaQueryList) => {
    setIsMobileEV(mq.matches)
  }

  const getUserInfo = () => {
    try {
      getUserInfoFx().then(r => null)
    } catch (e) {
      console.log('ERROR-getUserInfo')
    }
  }

  // single call
  useEffect(() => {
    if (userToken) {
      getUserInfo()

      if (theme === themeValue.xanova) {
        const parsedToken = parseJwt(userToken || '')
        const scope = parsedToken?.scope || []
        scope.includes('MEMBER') && fetchXanovaFormsFx().then(r => null)
      }
    }
  }, [userToken])

  useEffect(() => {
    handleChange(mediaQueryList)
    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [])

  const updateData = () => {
    initApp()
      .then(() => {
        setTimeout(() => {
          updateData()
        }, 40000)
      })
      .catch(error => {
        mainLoaderChangedEv(false)
        console.error('ERROR-initApp', error)
      })
  }

  useEffect(() => {
    if (favicon()) updateFavicon()
    updateData()
  }, [])

  useEffect(() => {
    if (!hasTravelRuleModalBeenShown && travelRuleData.length) {
      setTimeout(() => {
        Modal.open(<TravelRuleVerificationModal />, {
          variant: 'center',
          centerMobileFix: true,
          customCloseModal: () => {
            hasTravelRuleModalBeenShownEv(true)
            Modal.close()
          },
        })
      }, 2500)
    }
  }, [hasTravelRuleModalBeenShown, travelRuleData])

  return (
    <div className='app' data-theme={theme} style={theme === themeValue.fideumOTC ? { backgroundColor: 'white' } : {}}>
      <BrowserRouter>
        <GlobalHistory />
        <Modal.portal />
        <ErrorModal.portal />
        <MainSnackbar />
        <Layout>
          <Router />
        </Layout>
      </BrowserRouter>
    </div>
  )
}
