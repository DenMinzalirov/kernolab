import ReactDOM from 'react-dom/client'
import { attachLogger } from 'effector-logger'

import { env } from 'constant'
import { App } from 'features/app'

import 'components/i18n/localize'
import './styles/global.scss'
import reportWebVitals from 'reportWebVitals'

// env.NODE_ENV === 'development' && attachLogger()

const domNode = document.getElementById('root')!

const root = ReactDOM.createRoot(domNode)
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
