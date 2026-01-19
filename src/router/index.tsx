import { Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { MainLoader, RedirectHome } from 'components'
import { pages } from 'constant'
import {
  BankingPage,
  CardPage,
  ConfirmationCodePage,
  DeleteAccountPage,
  EarnPage,
  ForgotPasswordPage,
  IndividualLaunchpadPage,
  IndividualTokenPage,
  KYCPage,
  LaunchpadPage,
  PortfolioPage,
  SettingsPage,
  SigninPage,
  SignupPage,
  SupportPage,
  TransactionsHistoryPage,
  TwoFactorAuthenticationPage,
} from 'pages'
import { CardSecurityPage } from 'pages/card-security'
import { CardSettingsPage } from 'pages/card-settings'
import { DepositAssetPage } from 'pages/deposit-asset'
import { EarnAddPage } from 'pages/earn-add'
import { EarnInfoPage } from 'pages/earn-info'
import { LaunchpadPurchasePage } from 'pages/launchpad-purchase'
import { NewSuperchargePage } from 'pages/new-supercharge'
import { OtcPage } from 'pages/otc'
import { TravelRulePage } from 'pages/travel-rule'
import { WhitelistPage } from 'pages/whitelist'
import { WhitelistManagePage } from 'pages/whitelist-manage'
import { isBiz, isFideumOTC, isXanova, theme, themeValue } from 'config'

import { AccountSettingsPage } from '../biz/pages-biz/account-settings'
import { CryptoWalletsPageBiz } from '../biz/pages-biz/crypto-wallets'
import { DashboardPageBiz } from '../biz/pages-biz/dashboard'
import { FiatWalletsPageBiz } from '../biz/pages-biz/fiat-wallets'
import { KYCPageBiz } from '../biz/pages-biz/kyc'
import { ReceiveCryptoPageBiz } from '../biz/pages-biz/receive-crypto'
import { ReceiveFiatPageBiz } from '../biz/pages-biz/receive-fiat'
import { SendCryptoPageBiz } from '../biz/pages-biz/send-crypto'
import { SendFiatPageBiz } from '../biz/pages-biz/send-fiat'
import { SignInPageBiz } from '../biz/pages-biz/signin'
import { TradePageBiz } from '../biz/pages-biz/trade'
import { TransactionsPageBiz } from '../biz/pages-biz/transactions'
import { ClientsPageFideumOTC } from '../fideumOTC/pages-fideumOTC/clients-fideumOTC'
import { DashboardPageFideumOTC } from '../fideumOTC/pages-fideumOTC/dashboard'
import { DepositFiatPage } from '../pages/deposit-fiat'
import { PhysicalCardOrderPage } from '../pages/physical-card-order'
import { SettingsTwoFactorPage } from '../pages/settings-two-factor'
import { SettingsUserEmailPage } from '../pages/settings-user-email'
import { SettingsUserPasswordPage } from '../pages/settings-user-password'
import { SettingsUserPhonePage } from '../pages/settings-user-phone'
import { TradeAssetsPage } from '../pages/trade-assets'
import { WithdrawalAssetsPage } from '../pages/withdrawal-assets'
import { WithdrawalFiatPage } from '../pages/withdrawal-fiat'
import { getToken, parseJwt } from '../utils'
import { InsurancePageXanova } from '../xanova/page/insurance'
import { StartRepPage } from '../xanova/page/start-rep'
import { TradingInvestmentsPage } from '../xanova/page/trading-investments'
import { ForgotPasswordPageBiz } from 'biz/pages-biz/forgot-password'
import { ManageWhitelistPageBiz } from 'biz/pages-biz/manage-whitelist'
import { SignUpPageBiz } from 'biz/pages-biz/signup'
import { SupportPageBiz } from 'biz/pages-biz/support'
import { WhitelistPageBiz } from 'biz/pages-biz/whitelist'
import { AccountSettingsPageFideumOTC } from 'fideumOTC/pages-fideumOTC/account-settings'
import { AccountSettingsPageXanova } from 'xanova/page/account-settings'
import { AiToolPageXanova } from 'xanova/page/ai-tool'
import { ComissionsPageXanova } from 'xanova/page/comissions'
import { DashboardPageXanova } from 'xanova/page/dashboard'
import { ForgotPasswordPageXanova } from 'xanova/page/forgot-password'
import { KYCPageXanova } from 'xanova/page/kyc'
import { MembershipPageXanova } from 'xanova/page/membership'
import { PayoutsPageXanova } from 'xanova/page/payouts'
import { PensionPageXanova } from 'xanova/page/pension'
import { RequestPayoutXanovaPage } from 'xanova/page/request-payout-xanova'
import { SettingsTwoFactorPageXanova } from 'xanova/page/settings-two-factor'
import { SettingsUserEmailPageXanova } from 'xanova/page/settings-user-email'
import { SettingsUserPasswordPageXanova } from 'xanova/page/settings-user-password'
import { SignInPageXanova } from 'xanova/page/signin'
import { SignUpPageXanova } from 'xanova/page/signup'
import { WalletPageXanova } from 'xanova/page/wallet'

export function RequireKyc() {
  const token = getToken()
  const parsedToken = parseJwt(token)
  const scope = parsedToken?.scope

  if (scope && scope.length && !scope.includes('KYC')) {
    return <Navigate to={pages.KYC.path} replace />
  }

  if (isXanova && scope && scope.length && !scope.includes('MEMBER')) {
    return <Navigate to={pages.MEMBERSHIP.path} replace />
  }

  return <Outlet />
}

export function Router() {
  const renderRoutes = () => {
    if (isXanova) {
      return (
        <Routes>
          <Route path={pages.SignIn.path} element={<SignInPageXanova />} />
          <Route path={pages.ForgotPassword.path} element={<ForgotPasswordPageXanova />} />
          <Route path={pages.KYC.path} element={<KYCPageXanova />} />
          <Route path={pages.SignUp.path} element={<SignUpPageXanova />} />
          <Route path={pages.MEMBERSHIP.path} element={<MembershipPageXanova />} />

          <Route element={<RequireKyc />}>
            <Route path={pages.Base.path} element={<DashboardPageXanova />} />
            <Route path={pages.WALLET.path} element={<WalletPageXanova />} />
            <Route path={pages.AI_TOOL.path} element={<AiToolPageXanova />} />
            <Route path={pages.INSURANCE.path} element={<InsurancePageXanova />} />
            <Route path={pages.START_REP.path} element={<StartRepPage />} />
            <Route path={pages.TRADING_INVESTMENTS.path} element={<TradingInvestmentsPage />} />
            {/*//SETTINGS*/}
            <Route path={pages.ACCOUNT_SETTINGS.path} element={<AccountSettingsPageXanova />} />
            <Route path={pages.SETTINGS_TWO_FACTOR.path} element={<SettingsTwoFactorPageXanova />} />
            <Route path={pages.SETTINGS_USER_EMAIL.path} element={<SettingsUserEmailPageXanova />} />
            <Route path={pages.SETTINGS_USER_PASSWORD.path} element={<SettingsUserPasswordPageXanova />} />

            <Route path={pages.COMMISSIONS.path} element={<ComissionsPageXanova />} />

            <Route path={pages.PAYOUTS.path} element={<PayoutsPageXanova />} />
            <Route path={pages.PENSION.path} element={<PensionPageXanova />} />
            <Route path={pages.REQUEST_PAYOUT.path} element={<RequestPayoutXanovaPage />} />
          </Route>
          <Route path='*' element={<RedirectHome />} />
        </Routes>
      )
    }
    if (isFideumOTC) {
      return (
        <Routes>
          <Route path={pages.SignIn.path} element={<SignInPageBiz />} />

          <Route path={pages.Base.path} element={<DashboardPageFideumOTC />} />
          <Route path={pages.CLIENTS_FIDEUM_OTC.path} element={<ClientsPageFideumOTC />} />
          <Route path={pages.ACCOUNT_SETTINGS_FIDEUM_OTC.path} element={<AccountSettingsPageFideumOTC />} />

          <Route path='*' element={<RedirectHome />} />
        </Routes>
      )
    }
    if (isBiz) {
      return (
        <Routes>
          <Route
            path={pages.SignUp.path}
            element={themeValue.biz === theme ? <Navigate to={pages.SignIn.path} replace /> : <SignUpPageBiz />}
          />

          <Route path={pages.SignIn.path} element={<SignInPageBiz />} />
          <Route path={pages.ForgotPassword.path} element={<ForgotPasswordPageBiz />} />

          <Route element={<RequireKyc />}>
            <Route path={pages.Base.path} element={<DashboardPageBiz />} />

            <Route path={pages.CRYPTO_WALLETS.path} element={<CryptoWalletsPageBiz />} />
            <Route path={pages.FIAT_WALLETS.path} element={<FiatWalletsPageBiz />} />
            <Route path={pages.TRANSACTIONS_HISTORY.path} element={<TransactionsPageBiz />} />

            <Route path={pages.RECEIVE_CRYPTO.path} element={<ReceiveCryptoPageBiz />} />
            <Route path={pages.RECEIVE_FIAT.path} element={<ReceiveFiatPageBiz />} />

            <Route path={pages.SEND_CRYPTO.path} element={<SendCryptoPageBiz />} />
            <Route path={pages.SEND_FIAT.path} element={<SendFiatPageBiz />} />

            <Route path={pages.TRADE_CRYPTO.path} element={<TradePageBiz />} />

            <Route path={pages.WHITELIST.path} element={<WhitelistPageBiz />} />
            <Route path={pages.MANAGE_WHITELIST.path} element={<ManageWhitelistPageBiz />} />
          </Route>

          <Route path={pages.ACCOUNT_SETTINGS.path} element={<AccountSettingsPage />} />

          {/*// TODO off OTC*/}
          {/*{themeValue.biz === theme && (*/}
          {/*  <>*/}
          {/*    <Route path={pages.OTC.path} element={<OtcPageBiz />} />*/}
          {/*    <Route path={pages.OTC_NEW_TRADE.path} element={<OtcNewTradePageBiz />} />*/}
          {/*    <Route path={pages.OTC_DEPOSIT.path} element={<OtcDepositPageBiz />} />*/}
          {/*  </>*/}
          {/*)}*/}

          <Route path={pages.SUPPORT.path} element={<SupportPageBiz />} />

          <Route path={pages.KYC.path} element={<KYCPageBiz />} />

          <Route path='*' element={<RedirectHome />} />
        </Routes>
      )
    }
    return (
      <Routes>
        <Route path={pages.Base.path} element={<PortfolioPage />} />
        <Route path={pages.PORTFOLIO.path} element={<PortfolioPage />} />
        <Route path={pages.EARN.path} element={<EarnPage />} />
        <Route path={pages.EARN_INFO.path} element={<EarnInfoPage />} />
        <Route path={pages.NEW_EARNING.path} element={<EarnAddPage />} />
        <Route path={pages.NEW_SUPERCHARGE.path} element={<NewSuperchargePage />} />
        <Route path={pages.EARN.path} />
        <Route path={pages.CARD.path} element={<CardPage />} />
        <Route path={pages.CARD.path} />
        <Route path={pages.BANKING.path} element={<BankingPage />} />
        <Route path={pages.BANKING.path} />
        <Route path={pages.ASSET.path}>
          <Route path=':assetId' element={<IndividualTokenPage />} />
        </Route>
        <Route path={pages.SUPPORT.path} element={<SupportPage />} />
        <Route path={pages.WHITELIST.path} element={<WhitelistPage />} />
        <Route path={pages.WHITELIST_MANAGE.path} element={<WhitelistManagePage />} />
        <Route path={pages.DELETE_ACCOUNT.path} element={<DeleteAccountPage />} />
        <Route path={pages.SETTINGS.path} element={<SettingsPage />} />
        <Route path={pages.SETTINGS.path} />
        <Route path={pages.SignIn.path} element={<SigninPage />} />
        <Route path={pages.SignUp.path} element={<SignupPage />} />
        <Route path={pages.ForgotPassword.path} element={<ForgotPasswordPage />} />
        <Route path={pages.ConfirmationCode.path} element={<ConfirmationCodePage />} />
        <Route path={pages.TwoFactorAuthentication.path} element={<TwoFactorAuthenticationPage />} />
        <Route path={pages.TRANSACTIONS_HISTORY.path} element={<TransactionsHistoryPage />} />
        <Route path={pages.TRAVEL_RULE.path} element={<TravelRulePage />} />
        <Route path={pages.KYC.path} element={<KYCPage />} />
        <Route path={pages.LAUNCHPAD.path} element={<LaunchpadPage />} />
        <Route path={pages.LAUNCHPAD_PURCHASE.path} element={<LaunchpadPurchasePage />} />
        <Route path={pages.INDIVIDUAL_LAUNCHPAD.path}>
          <Route path=':launchpadId' element={<IndividualLaunchpadPage />} />
        </Route>
        <Route path={pages.OTC.path} element={<OtcPage />} />

        {/*//SETTINGS*/}
        <Route path={pages.SETTINGS_TWO_FACTOR.path} element={<SettingsTwoFactorPage />} />
        <Route path={pages.SETTINGS_USER_EMAIL.path} element={<SettingsUserEmailPage />} />
        <Route path={pages.SETTINGS_USER_PHONE.path} element={<SettingsUserPhonePage />} />
        <Route path={pages.SETTINGS_USER_PASSWORD.path} element={<SettingsUserPasswordPage />} />

        <Route path={pages.TRADE_ASSETS.path} element={<TradeAssetsPage />} />
        <Route path={pages.DEPOSIT_ASSET.path} element={<DepositAssetPage />} />
        <Route path={pages.WITHDRAWAL_ASSETS.path} element={<WithdrawalAssetsPage />} />

        {/* BANKING */}
        <Route path={pages.DEPOSIT_FIAT.path} element={<DepositFiatPage />} />
        <Route path={pages.WITHDRAWAL_FIAT.path} element={<WithdrawalFiatPage />} />

        {/* CARD SETTINGS */}
        <Route path={pages.CARD_SETTINGS.path} element={<CardSettingsPage />} />
        <Route path={pages.CARD_SECURITY.path} element={<CardSecurityPage />} />
        <Route path={pages.PHYSICAL_CARD_ORDER.path} element={<PhysicalCardOrderPage />} />

        <Route path='*' element={<RedirectHome />} />
      </Routes>
    )
  }

  return <Suspense fallback={<MainLoader />}>{renderRoutes()}</Suspense>
}
