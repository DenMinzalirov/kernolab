import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'

import { en } from 'constant/translations'

i18n.use(initReactI18next).init({
  returnNull: false,
  resources: {
    en: {
      translation: en,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
