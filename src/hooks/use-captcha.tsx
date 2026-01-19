import { useCallback, useState } from 'react'
import { BoundTurnstileObject } from 'react-turnstile'

import { isBiz, theme, themeValue } from '../config'
import configDataJson from '../configData.json'

export const turnstileSiteKey = '0x4AAAAAAA_DDeMqbHwoIdvv' //'3x00000000000000000000FF'

async function getMyIp(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const res = await response.json()
    return res.ip
  } catch (err) {
    console.error('Problem fetching my IP', err)
    return null
  }
}

export function useCaptcha() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [deviceIp, setDeviceIp] = useState<string | null>(null)
  const [boundTurnstileState, setBoundTurnstileState] = useState<BoundTurnstileObject | null>(null)
  const [isShowWidget, setIsShowWidget] = useState(false)

  // configDataJson
  // const isCaptchaOff = configDataJson.isCaptchaOff || theme === themeValue.biz || theme === themeValue.kaizen
  const isCaptchaOff = true
  const customHeaderData = isCaptchaOff
    ? {}
    : {
        'X-Turnstile-Token': turnstileToken,
        // 'CF-Connecting-IP': deviceIp,
      }

  const isDisableBtnCaptcha = isCaptchaOff ? false : !(deviceIp && turnstileToken)

  const handleLoad = useCallback((widgetId: string) => {
    if (isCaptchaOff) return
    setTimeout(() => {
      setIsShowWidget(true)
    }, 500)
  }, [])

  const handleResetTurnstile = useCallback(() => {
    setTurnstileToken('')

    boundTurnstileState && boundTurnstileState.reset()
  }, [boundTurnstileState])

  const handleVerify = useCallback(async (token: string, boundTurnstile: BoundTurnstileObject) => {
    setTurnstileToken(token)

    setBoundTurnstileState(boundTurnstile)
    try {
      const ip = await getMyIp()

      setDeviceIp(ip)
    } catch (error) {
      console.error('Error getting IP address:', error)
    }
  }, [])

  return {
    customHeaderData,
    handleResetTurnstile,
    handleVerify,
    isShowWidget,
    handleLoad,
    isDisableBtnCaptcha,
    isCaptchaOff,
  }
}

// isReadyWidget,
//     isShowWidget,
//     handleResetTurnstile,
//     handleVerify,
//     handleLoad,
//     customHeaderData,
//     isDisableBtnCaptcha,
