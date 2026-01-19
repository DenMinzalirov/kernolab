import { env } from 'constant'
import { getCurrentBreakpoint } from 'utils/get-current-breakpoint'
import xanovaIco from 'assets/favicons/favicon-152_xenova.png'
import fideumIco from 'assets/favicons/fideum64.png'
import kaizenIco from 'assets/favicons/kaizen64.png'
import kernolabIco from 'assets/favicons/kernolab64.png'
import pairsIco from 'assets/favicons/pairs64.png'
import zekretIco from 'assets/favicons/zekret64.png'
import bbank from 'assets/icons/bb-name.svg'
import { FideumAuthLogo } from 'assets/icons/fideumAuthLogo'
import fideumLogo from 'assets/icons/fideumLogo.svg'
import fideumLogoMd from 'assets/icons/fideumLogoMd.svg'
import fideumLogoOTC from 'assets/icons/fideumLogoOTC.svg'
import fideumOnboardingLogo from 'assets/icons/fideumOnboardingLogo.svg'
import { KaizenAuthLogo } from 'assets/icons/kaizenAuthLogo'
import kaizenLogo from 'assets/icons/kaizenLogo.svg'
import kaizenOnboardingLogo from 'assets/icons/kaizenOnboardingLogo.svg'
import kernolabLogo from 'assets/icons/KernolabLogo.png'
import zekretLogo from 'assets/icons/zekretLogo.svg'

import { ZekretAuthLogo } from '../assets/icons/zekretAuthLogo'
import { BREAKPOINT } from 'hooks/use-current-breakpoint'

export const themeValue = {
  fideum: 'fideum', // app.fideum.group
  biz: 'biz', // app.fideum.com
  kaizen: 'kaizen', //app.kaizenCx.com
  pairs: 'pairs',
  zekret: 'zekret',
  fideumOTC: 'otc',
  xanova: 'xanova',
  kernolab: 'kernolab',
}

const developUrls = {
  DEV: {
    API_BASE_URL: 'https://dev-public-api.victor.al',
    API_BASE_AUTH_URL: 'https://dev-auth-api.victor.al',
    XANOVA_API_CHART_URL: 'https://xenova-ext.fideum.dev',
  },
  // DEV-old: {
  //   API_BASE_URL: 'https://api.fideum.dev',
  //   API_BASE_AUTH_URL: 'https://auth.fideum.dev',
  //   XANOVA_API_CHART_URL: 'https://xenova-ext.fideum.dev',
  // },
  STG: {
    API_BASE_URL: 'https://api-staging.fideum.dev',
    API_BASE_AUTH_URL: 'https://auth-staging.fideum.dev',
    XANOVA_API_CHART_URL: 'https://xenova-ext.fideum.dev',
  },
  PROD: {
    API_BASE_URL: 'https://api.pairs.xyz',
    API_BASE_AUTH_URL: 'https://auth.pairs.xyz',
    APP_URL: 'https://app.pairs.xyz',
    XANOVA_API_CHART_URL: 'https://ext.xanova-essence.com',
  },
}

const ENV: 'DEV' | 'STG' | 'PROD' = 'DEV'

const API_BASE_URL = env.REACT_APP_BACKEND_URL || developUrls[ENV].API_BASE_URL
const API_BASE_AUTH_URL = env.REACT_APP_BACKEND_AUTH_URL || developUrls[ENV].API_BASE_AUTH_URL
const XANOVA_API_CHART_URL = env.REACT_APP_XANOVA_API_CHART_URL || developUrls[ENV].XANOVA_API_CHART_URL
// TODO: index theme state for change UI
const theme = env.REACT_APP_CEFI_WHITE_LABEL ?? themeValue.kernolab

const isXanova = theme === themeValue.xanova
const isBiz = theme === themeValue.biz || theme === themeValue.kaizen || theme === themeValue.zekret
const isFideumOTC = theme === themeValue.fideumOTC

const HELP_LINKS = {
  FAQ: 'https://support.pairs.xyz/portal',
  TERMS: 'https://www.pairs.xyz/terms',
  CARD_TERMS: 'https://www.pairs.xyz/debit-card-terms',
  DELETE_CEFI_ACCOUNT: 'https://support.pairs.xyz/portal/en/kb/articles/article',
  LAUNCH_A_PROJECT: 'https://form.typeform.com/to/IOV9EFa9?typeform-source=70y3ggn7l5c.typeform.com',
}

const kycLevel = (): string => {
  // @ts-ignore
  if (theme === themeValue.kaizen) {
    return 'KaizenCX'
  }
  return 'basic-kyc-level'
}

const favicon = (): string | null => {
  if (theme === themeValue.fideumOTC) {
    return fideumIco
  }
  if (theme === themeValue.biz) {
    return fideumIco
  }
  if (theme === themeValue.kaizen) {
    return kaizenIco
  }
  if (theme === themeValue.zekret) {
    return zekretIco
  }
  if (theme === themeValue.xanova) {
    return xanovaIco
  }
  if (theme === themeValue.kernolab) {
    return kernolabIco
  }

  return pairsIco
}

const documentTitle = (): string => {
  if (theme === themeValue.fideumOTC) {
    return 'Fideum - Web App'
  }
  if (theme === themeValue.biz) {
    return 'Fideum - Web App'
  }
  if (theme === themeValue.kaizen) {
    return 'Kaizencx - Web App'
  }

  if (theme === themeValue.zekret) {
    return 'Zekret - Web App'
  }
  if (theme === themeValue.xanova) {
    return 'Xanova - Web App'
  }
  if (theme === themeValue.kernolab) {
    return 'Kernolab - Web App'
  }

  return 'Pairs - Web App'
}

const qrName = (): string => {
  let prefix = ''
  if (API_BASE_URL.includes('dev')) {
    prefix = '-DEV'
  }
  if (API_BASE_URL.includes('staging')) {
    prefix = '-STG'
  }

  if ([themeValue.biz, themeValue.fideumOTC].includes(theme)) {
    return 'Fideum'
  }
  if (theme === themeValue.kaizen) {
    return 'KaizenCX'
  }
  if (theme === themeValue.xanova) {
    return 'Xanova'
  }
  if (theme === themeValue.kernolab) {
    return 'Kernolab'
  }

  return `Pairs${prefix}`
}

const fideumMainColor = '#9C88FD'
const kaizenMainColor = '#003EF5'
const bbMainColor = '#9A95CE'

const themeLogo = (): string | undefined => {
  const breakpoint = getCurrentBreakpoint()

  if ([themeValue.biz].includes(theme)) {
    return [BREAKPOINT.md, BREAKPOINT.sm].includes(breakpoint) ? fideumLogoMd : fideumLogo
  }
  if (theme === themeValue.kaizen) {
    return kaizenLogo
  }
  if (theme === themeValue.zekret) {
    return zekretLogo
  }
  if (theme === themeValue.fideumOTC) {
    return fideumLogoOTC
  }
  if (theme === themeValue.kernolab) {
    return kernolabLogo
  }
  return bbank
}
const getAuthLogo = () => {
  if (theme === themeValue.biz) {
    return <FideumAuthLogo fill='#fff' />
  }
  if (theme === themeValue.kaizen) {
    return <KaizenAuthLogo />
  }
  if (theme === themeValue.zekret) {
    return <ZekretAuthLogo />
  }
  return null
}

const getFooterTitle = (): string => {
  if (theme === themeValue.biz) {
    return '2025 @ Fideum | Fideum Group. All rights reserved.'
  }
  if (theme === themeValue.kaizen) {
    return '2025 @ Kaizen CX. All rights reserved.'
  }
  if (theme === themeValue.zekret) {
    return '2025 @Zekret. All rights reserved.'
  }
  return ''
}

//TODO deprecate
const themeGlobalColor = (): string => {
  const div = document.querySelector<HTMLDivElement>('.app') || document.documentElement
  const blue = getComputedStyle(div).getPropertyValue('--Blue').trim()

  if (theme === themeValue.biz) {
    return blue
  }
  if (theme === themeValue.kaizen) {
    return blue
  }
  return fideumMainColor
}

const termsOfUseLink = (): string => {
  // @ts-ignore
  if (theme === themeValue.kaizen) {
    return 'https://files.kaizencx.com/TERMS%20&%20CONDITIONS%20-%20KAIZENCX.pdf'
  }
  if (theme === themeValue.zekret) {
    return 'https://www.zekret.xyz/terms-conditions'
  }
  return HELP_LINKS.TERMS
}

const ZEEKNODEPRICE = {
  'Tranche 1': 350,
  'Tranche 2': 400,
  'Tranche 3': 450,
  'Tranche 4': 500,
  'Tranche 5': 550,
}

// Fideum Pairs Launchpad
// TBD
// hide Total Raised and Supply Amount
const TBDHideId = ['20d369d5-9616-40d6-8e27-6a28acada05a']

const helpSupportUrl = (): string => {
  if (theme === themeValue.biz) {
    return 'https://forms.helpdesk.com/?licenseID=1962211529&contactFormID=bced4a7e-f57e-4dec-81b3-872e385a366f'
  }
  if (theme === themeValue.kaizen) {
    return 'https://forms.helpdesk.com/?licenseID=1962211529&contactFormID=b54aae54-b7b4-4411-ba59-19039f2394b0'
  }
  return 'https://forms.helpdesk.com?licenseID=1962211529&contactFormID=8745731d-0948-415a-af9f-0e5b7ffb820d'
}

//Xanova
const getReferralLinkXanova = (referral: string): string => {
  if (!referral) return ''

  const domain = window.location.origin

  return `${domain}/sign-up?ref=${referral}`
}

const goSupportXanova = () => {
  window.location.href = 'mailto:contacto@xanova-essence.com'
}

export {
  API_BASE_URL,
  API_BASE_AUTH_URL,
  XANOVA_API_CHART_URL,
  documentTitle,
  favicon,
  qrName,
  theme,
  themeGlobalColor,
  themeLogo,
  getFooterTitle,
  // themeOnboardingLogo,
  termsOfUseLink,
  kycLevel,
  HELP_LINKS,
  ZEEKNODEPRICE,
  getAuthLogo,
  helpSupportUrl,
  TBDHideId,
  isBiz,
  isFideumOTC,
  isXanova,
  getReferralLinkXanova,
  goSupportXanova,
}
