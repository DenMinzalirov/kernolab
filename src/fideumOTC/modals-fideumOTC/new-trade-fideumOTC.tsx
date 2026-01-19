import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import {
  B2C2CombinedInstrumentResponse,
  B2C2PriceRequest,
  OTCClient,
  OTCStatus,
  OTCTrade,
  OTCTradeCreateRequest,
  OTCTradeServices,
} from 'wip/services/fideumOTC-services/OTC-trade'

import { ClientSearch, InstrumentSearch, LPSearch } from '../components'
import {
  cleanDecimalString,
  getCellValue,
  getDecimalLength,
  getStatusBadgeStyle,
  isInRange,
} from '../features-fideumOTC/trades-fideumOTC/utils'
import {
  $currentPrice,
  $priceError,
  fetchPrice,
  resetPriceState,
  setPriceRequest,
  startPriceInterval,
  stopPriceInterval,
} from '../model/b2c2price'
import { $clientsOTC } from '../model/clients-fideumOTC'
import { $instrumentsOTC } from '../model/insruments-B2C2-fideumOTC'
import { $lpOTC } from '../model/lp-fideumOTC'
import { $tradesOTC, refreshTrades } from '../model/trades-fideumOTC'
import lock from './lock.svg'
import styles from './styles.module.scss'
import { TradeComment } from './trade-comment'
import unlock from './unlock.svg'
import { confirmModal } from 'biz/features-biz/modals-biz/confirmation-modal-biz/confirm-modal'

interface TradeFormData {
  clientUuid: string
  liquidityProvider: string
  instrument: string
  side: 'BUY' | 'SELL'
  sideRight: 'BUY' | 'SELL'
  amountLeft: string
  amountRight: string
  markup: string
  rate: string
  clientLeftAmount: string
  clientRightAmount: string
  clientRate: string
}

interface NewTradeModalFideumOTCProps {
  uuid?: string // для редактирования
}

export function NewTradeModalFideumOTC({ uuid }: NewTradeModalFideumOTCProps) {
  const trades = useUnit($tradesOTC)
  const clients = useUnit($clientsOTC)
  const instruments = useUnit($instrumentsOTC)
  const lpOTC = useUnit($lpOTC)
  const currentPrice = useUnit($currentPrice)
  const priceError = useUnit($priceError)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
    getValues,
    clearErrors,
    control,
  } = useForm<TradeFormData>({
    defaultValues: {
      clientUuid: '',
      liquidityProvider: '',
      instrument: '',
      side: 'BUY',
      sideRight: 'SELL',
      amountLeft: '',
      amountRight: '',
      rate: '',
      markup: '0',
      clientLeftAmount: '',
      clientRightAmount: '',
      clientRate: '',
    },
  })

  const tradeData = trades.find(tradeItem => tradeItem.tradeUuid === uuid)

  const [createdTrade, setCreatedTrade] = useState(tradeData || null)
  const [loadingState, setLoadingState] = useState({
    onSubmit: false,
    updateClientPrice: false,
    updateClient: false,
    fetchingClient: false,
  })
  const defaultInstrument =
    instruments.find(instrumentItem => {
      return instrumentItem.name === 'EURUSC' || instrumentItem.name === 'USCEUR'
    }) || null

  const [selectedClient, setSelectedClient] = useState<OTCClient | null>(null)
  const [fetchedClient, setFetchedClient] = useState<OTCClient | null>(null)
  const [selectedLP, setSelectedLP] = useState<string>(lpOTC[0] || '')
  const [selectedInstrument, setSelectedInstrument] = useState<B2C2CombinedInstrumentResponse | null>(
    defaultInstrument || null
  )
  const [serverError, setServerError] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [highlightDirection, setHighlightDirection] = useState<'left' | 'right'>('left')

  const [isClientLeftAmountBlock, setIsClientLeftAmountBlock] = useState(false)

  const previousRateRef = useRef<string>(null)

  const selectedInstrumentRef = useRef<B2C2CombinedInstrumentResponse | null>(null)
  const focusedFieldRef = useRef<string | null>(null)
  const highlightDirectionRef = useRef<'left' | 'right' | null>(null)

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РАСЧЕТА ==========

  // Получить точность для округления
  const getPrecision = useCallback(() => {
    return getDecimalLength(selectedInstrumentRef.current?.quantityPrecision || selectedInstrument?.quantityPrecision)
  }, [selectedInstrument?.quantityPrecision])

  // Расчет amountRight = amountLeft * rate
  const calculateAmountRight = useCallback(
    (amountLeft: string, rate: string): string => {
      if (!rate || !amountLeft) return ''
      return (Number(amountLeft) * Number(rate)).toString() // .toFixed(getPrecision())
    },
    [getPrecision]
  )

  // Расчет amountLeft = amountRight / rate
  const calculateAmountLeft = useCallback(
    (amountRight: string, rate: string): string => {
      if (!rate || !amountRight) return ''
      return (Number(amountRight) / Number(rate)).toString() // .toFixed(getPrecision())
    },
    [getPrecision]
  )

  // Валидация amounts (без изменения полей)
  const validateAmounts = useCallback((): boolean => {
    const { amountLeft, amountRight } = getValues()
    const instrumentRef = selectedInstrument
    const direction = highlightDirection

    if (!instrumentRef) return false

    // Валидация для левой стороны
    if (direction === 'left') {
      if (!amountLeft) {
        return false
      }

      if (+instrumentRef.leftMinimumAmount > +amountLeft) {
        setError('amountLeft', {
          message: `Please enter a value between ${+instrumentRef.leftMinimumAmount} and ${+instrumentRef.leftMaximumAmount}`,
          type: 'min',
        })
        return false
      }

      if (+instrumentRef.leftMaximumAmount < +amountLeft) {
        setError('amountLeft', {
          message: `Please enter a value between ${+instrumentRef.leftMinimumAmount} and ${+instrumentRef.leftMaximumAmount}`,
          type: 'max',
        })
        return false
      }
    }

    // Валидация для правой стороны
    if (direction === 'right') {
      if (!amountRight) {
        return false
      }

      if (+instrumentRef.rightMinimumAmount > +amountRight) {
        setError('amountRight', {
          message: `Please enter a value between ${+instrumentRef.rightMinimumAmount} and ${+instrumentRef.rightMaximumAmount}`,
          type: 'min',
        })
        return false
      }

      if (+instrumentRef.rightMaximumAmount < +amountRight) {
        setError('amountRight', {
          message: `Please enter a value between ${+instrumentRef.rightMinimumAmount} and ${+instrumentRef.rightMaximumAmount}`,
          type: 'max',
        })
        return false
      }
    }

    clearErrors(['amountLeft', 'amountRight'])
    return true
  }, [getValues, selectedInstrument, highlightDirection, setError, clearErrors])

  const changeRightValues = (values: TradeFormData) => {
    const newAmountLeft = calculateAmountLeft(values.amountRight, values.rate)
    setValue('amountLeft', newAmountLeft, { shouldValidate: false, shouldDirty: false })
    setValue('clientLeftAmount', newAmountLeft || '', { shouldValidate: false, shouldDirty: false })
    const cf = values.side === 'BUY' ? 1 : -1
    const newRate = +values.rate * (1 + (+values.markup * cf) / 100)
    setValue('clientRate', newRate.toString())
    if (+values.markup) {
      setValue('clientRightAmount', (+newAmountLeft * newRate).toString())
    } else {
      setValue('clientRightAmount', values.amountRight)
    }
    // setValue('clientRightAmount', (+values.rate * (1 + +values.amountRight / 100)).toString())
  }
  const changeLeftValues = (values: TradeFormData) => {
    const newAmountRight = calculateAmountRight(values.amountLeft, values.rate)
    setValue('amountRight', newAmountRight, { shouldValidate: false, shouldDirty: false })
    const cf = values.side === 'BUY' ? 1 : -1
    const newRate = +values.rate * (1 + (+values.markup * cf) / 100)
    setValue('clientLeftAmount', values.amountLeft || '', { shouldValidate: false, shouldDirty: false })
    setValue('clientRate', newRate.toString())
    setValue('clientRightAmount', (+values.amountLeft * newRate).toString())
  }

  // Универсальное обновление всех связанных полей
  const updateRelatedFields = (changedField: 'rate' | 'amountLeft' | 'amountRight' | 'markup') => {
    if (createdTrade) return

    const values = getValues()
    const direction = highlightDirectionRef.current
    if (changedField === 'rate') {
      if (direction === 'left') {
        changeLeftValues(values)
      } else if (direction === 'right') {
        changeRightValues(values)
      }
    } else if (changedField === 'amountLeft') {
      if (direction === 'left' && values.rate) {
        changeLeftValues(values)
      }
    } else if (changedField === 'amountRight') {
      if (direction === 'right' && values.rate) {
        changeRightValues(values)
      }
    } else if (changedField === 'markup') {
      // При изменении markup пересчитываем только клиентские поля
      if (direction === 'left' && values.rate && values.amountLeft) {
        // clientLeftAmount не меняется
        setValue('clientLeftAmount', values.amountLeft || '', { shouldValidate: false, shouldDirty: false })

        const newRate = +values.rate * (1 + +values.markup / 100)

        setValue('clientRate', newRate.toString())
        setValue('clientRightAmount', (+values.amountLeft * newRate).toString())
      } else if (direction === 'right' && values.rate && values.amountRight) {
        const amountLeft = calculateAmountLeft(values.amountRight, values.rate)

        // clientLeftAmount не меняется
        setValue('clientLeftAmount', amountLeft || '', { shouldValidate: false, shouldDirty: false })
        const newRate = +values.rate * (1 + +values.markup / 100)

        setValue('clientRate', newRate.toString())
        if (!values.markup || values.markup === '0') {
          setValue('clientRightAmount', values.amountRight)
        } else {
          setValue('clientRightAmount', (+values.amountRight + (+values.markup / 100) * +values.amountRight).toString())
        }
      }
    }
  }

  // Эффект для загрузки клиента по UUID, если его нет в глобальном состоянии
  useEffect(() => {
    const fetchClientByUuid = async (clientUuid: string) => {
      try {
        setLoadingState(prev => ({ ...prev, fetchingClient: true }))
        const response = await OTCTradeServices.getOTCClients({
          clientUuid_eq: clientUuid,
          size: 1,
          page: 0,
        })

        if (response.content && response.content.length > 0) {
          const client = response.content[0]
          setFetchedClient(client)
          setSelectedClient(client)
          const displayValueClient = `${client.email}`
          setValue('clientUuid', displayValueClient)
        } else {
          console.warn('Client not found by UUID:', clientUuid)
        }
      } catch (error) {
        console.error('ERROR-fetchClientByUuid', error)
      } finally {
        setLoadingState(prev => ({ ...prev, fetchingClient: false }))
      }
    }

    if (createdTrade?.clientUuid) {
      // Сначала ищем в глобальном состоянии
      const client = clients.find(clientItem => clientItem.clientUuid === createdTrade.clientUuid)

      if (client) {
        // Клиент найден в глобальном состоянии
        const displayValueClient = `${client.email}`
        setValue('clientUuid', displayValueClient)
        setSelectedClient(client)
        setFetchedClient(null)
      } else {
        // Клиента нет в глобальном состоянии - запрашиваем с сервера
        fetchClientByUuid(createdTrade.clientUuid)
      }
    }
  }, [createdTrade?.clientUuid, clients])

  useEffect(() => {
    setValue('liquidityProvider', lpOTC[0] || '')
    // Точка загрузки существующего трэйда
    if (createdTrade) {
      // Логика инициализации клиента вынесена в отдельный useEffect выше

      setValue('liquidityProvider', createdTrade.liquidityProvider)
      setSelectedLP(createdTrade.liquidityProvider)

      const instrument = instruments.find(instrumentItem => instrumentItem.name === createdTrade?.instrument)
      instrument && setSelectedInstrument(instrument)
      const displayValueInstrument = `${instrument?.name}`
      setValue('instrument', displayValueInstrument)

      const currencyLeft = instrument?.name.substring(0, 3)
      if (currencyLeft === createdTrade.currency) {
        setHighlightDirection('left')
        setValue('side', createdTrade.side)
        setValue('sideRight', createdTrade.side === 'BUY' ? 'SELL' : 'BUY')
      } else {
        setHighlightDirection('right')
        setValue('sideRight', createdTrade.side)
        setValue('side', createdTrade.side === 'BUY' ? 'SELL' : 'BUY')
      }

      setValue('rate', (+createdTrade.executedPrice).toString())
      if (currencyLeft === createdTrade.currency) {
        setValue('amountLeft', (+createdTrade.amount).toString())
        setValue('amountRight', (+createdTrade.amount * +createdTrade.executedPrice).toString())
      } else {
        setValue('amountRight', (+createdTrade.amount).toString())
        setValue('amountLeft', (+createdTrade.amount / +createdTrade.executedPrice).toString())
      }

      const from = createdTrade.instrument.substring(0, 3)
      if (createdTrade.currency === from) {
        const cf = createdTrade.side === 'BUY' ? 1 : -1
        const clientRate = +createdTrade.clientRightAmount / +createdTrade.clientLeftAmount
        setValue(
          'markup',
          (((clientRate - +createdTrade.executedPrice) / +createdTrade.executedPrice) * 100 * cf).toFixed(3)
        )
      } else {
        const cf = createdTrade.side === 'BUY' ? -1 : 1
        const clientRate = +createdTrade.clientRightAmount / +createdTrade.clientLeftAmount
        setValue(
          'markup',
          (
            (+createdTrade.clientRightAmount / +createdTrade.clientLeftAmount / +createdTrade.executedPrice - 1) *
            100 *
            cf
          ).toFixed(3)
        )
      }

      setValue('clientRightAmount', (+createdTrade.clientRightAmount).toString())
      setValue('clientLeftAmount', (+createdTrade.clientLeftAmount).toString())

      setValue('clientRate', (+createdTrade.clientRightAmount / +createdTrade.clientLeftAmount).toString())
    }
  }, [])

  // Эффект для запуска интервала обновления цены через глобальное состояние (только для нового трейда)
  useEffect(() => {
    if (!uuid) {
      // Запускаем интервал для нового трейда (первый запрос делается в useEffect priceRequest)
      const intervalId = setInterval(() => {
        fetchPrice()
      }, 2000)

      startPriceInterval()

      return () => {
        clearInterval(intervalId)
        stopPriceInterval()
        resetPriceState()
      }
    }
  }, [uuid])

  const amountLeftWatch = useWatch({ control, name: 'amountLeft' })
  const amountRightWatch = useWatch({ control, name: 'amountRight' })
  const sideWatch = useWatch({ control, name: 'side' })
  const sideRightWatch = useWatch({ control, name: 'sideRight' })
  const markupWatch = useWatch({ control, name: 'markup' })

  // Обновление priceRequest при изменении параметров формы
  useEffect(() => {
    if (!uuid && selectedInstrument && highlightDirection) {
      const { amountLeft, amountRight, side, sideRight } = getValues()

      // Проверяем валидность
      const isValid = validateAmounts()

      if (!isValid) {
        // Останавливаем запросы и очищаем зависимые поля
        setPriceRequest(null)
        setValue('rate', '')
        resetPriceState()
        // if (highlightDirection === 'left') {
        //   setValue('amountRight', '')
        // } else {
        //   setValue('amountLeft', '')
        // }
        // setValue('clientLeftAmount', '')
        // setValue('clientRightAmount', '')
        // setValue('clientRate', '')
        return
      }

      // Все ОК - формируем запрос
      const amount = highlightDirection === 'left' ? amountLeft : amountRight

      const priceRequest = {
        name: selectedInstrument.name,
        currency:
          highlightDirection === 'left' ? selectedInstrument.name.substring(0, 3) : selectedInstrument.name.slice(-3),
        side: highlightDirection === 'left' ? side : sideRight,
        amount: cleanDecimalString(amount),
      }

      setPriceRequest(priceRequest)

      // Делаем немедленный запрос при установке валидного priceRequest
      fetchPrice()
    }
  }, [
    uuid,
    selectedInstrument,
    highlightDirection,
    amountLeftWatch,
    amountRightWatch,
    sideWatch,
    sideRightWatch,
    validateAmounts,
    getValues,
    setValue,
  ])

  // Обновление поля rate при получении новой цены
  useEffect(() => {
    if (!uuid && !createdTrade && currentPrice?.rate) {
      setValue('rate', currentPrice.rate)
      updateRelatedFields('rate')
    }
  }, [currentPrice?.rate, uuid])

  // Обновление ошибки сервера при ошибке получения цены
  useEffect(() => {
    if (!uuid && !createdTrade && priceError) {
      setServerError(priceError)
    }
    if (!uuid && !createdTrade && !priceError) {
      setServerError('')
    }
  }, [priceError, uuid])

  useEffect(() => {
    const { instrument } = getValues()
    if (!instrument && selectedInstrument?.name) {
      const displayValueInstrument = `${selectedInstrument?.name}`
      setValue('instrument', displayValueInstrument)
    }
    !createdTrade &&
      setValue('amountLeft', (+(selectedInstrument?.leftMinimumAmount || 0)).toString() || '', {
        shouldValidate: false,
        shouldDirty: false,
      })
    selectedInstrumentRef.current = selectedInstrument
  }, [selectedInstrument?.name])

  useEffect(() => {
    focusedFieldRef.current = focusedField
  }, [focusedField])

  useEffect(() => {
    highlightDirectionRef.current = highlightDirection
  }, [highlightDirection])

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (createdTrade) return

      // Обработка изменения rate
      if (name === 'rate') {
        // const currentRate = value.rate || ''

        // if (currentRate !== previousRateRef.current) {
        //   previousRateRef.current = currentRate
        updateRelatedFields('rate')
        // }
      }

      // Обработка изменений через пользовательский ввод
      if (type === 'change' && name) {
        // Очистка зависимых полей при отсутствии rate
        if (!value?.rate) {
          if (highlightDirectionRef.current === 'left') {
            setValue('amountRight', '', { shouldValidate: false, shouldDirty: false })
          } else if (highlightDirectionRef.current === 'right') {
            setValue('amountLeft', '', { shouldValidate: false, shouldDirty: false })
          }
        }

        // Обновление при изменении amountLeft и amountRight теперь происходит в onChange handlers

        // Обновление при изменении markup
        if (name === 'markup') {
          updateRelatedFields('markup')
        }

        // Синхронизация side
        if (name === 'side' && highlightDirectionRef.current === 'left') {
          setValue('sideRight', value.side === 'BUY' ? 'SELL' : 'BUY', { shouldValidate: false, shouldDirty: false })
        }

        if (name === 'sideRight' && highlightDirectionRef.current === 'right') {
          setValue('side', value.sideRight === 'BUY' ? 'SELL' : 'BUY', { shouldValidate: false, shouldDirty: false })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, createdTrade, updateRelatedFields, setValue])

  const onSubmit = async (data: TradeFormData) => {
    setServerError('')

    if (!selectedLP) {
      setError('liquidityProvider', { type: 'manual', message: 'Liquidity provider is required' })
      return
    }

    if (!selectedInstrument) {
      setError('instrument', { type: 'manual', message: 'Instrument is required' })
      return
    }

    if (!data.amountRight) {
      setError('amountRight', {
        message: `Please enter a value between ${+selectedInstrument.rightMinimumAmount} and ${+selectedInstrument.rightMaximumAmount}`,
        type: 'manual',
      })
      return
    }

    if (!data.amountLeft) {
      setError('amountLeft', {
        message: `Please enter a value between ${+selectedInstrument.leftMinimumAmount} and ${+selectedInstrument.leftMaximumAmount}`,
        type: 'manual',
      })
      return
    }

    setLoadingState(prev => ({
      ...prev,
      onSubmit: true,
    }))

    try {
      try {
        const trade: OTCTradeCreateRequest = {
          clientUuid: selectedClient?.clientUuid || '',
          liquidityProvider: selectedLP,
          instrument: selectedInstrument.name,
          currency:
            highlightDirection === 'left' ? selectedInstrument.name.substring(0, 3) : selectedInstrument.name.slice(-3),
          side: highlightDirection === 'left' ? data.side : data.sideRight,
          amount: (highlightDirection === 'left' ? +data.amountLeft : +data.amountRight).toFixed(getPrecision()),
          expectedExecutionPrice: data.rate,
          markup: data.markup,
          clientLeftAmount: data.clientLeftAmount,
          clientRightAmount: data.clientRightAmount,
        }

        const result = await OTCTradeServices.executeOTCTrade(trade)
        refreshTrades()

        setCreatedTrade(result)
        // stopRateUpdateInterval()
      } catch (error) {
        console.log('ERROR-executeOTCTrade', error)
      }
    } catch (error: any) {
      console.error('Failed to save trade:', error)
      setServerError(error.message || 'Failed to save trade')
    } finally {
      setLoadingState(prev => ({
        ...prev,
        onSubmit: false,
      }))
    }
  }

  const updateClientPrice = async () => {
    const ok = await confirmModal('updateClientPriceFideumOTC')
    if (!ok) return
    try {
      setLoadingState(prev => ({
        ...prev,
        updateClientPrice: true,
      }))

      const formData = getValues()
      const resAmounts = await OTCTradeServices.editClientAmountsOTCTradeRequest(createdTrade!.tradeUuid, {
        clientLeftAmount: formData.clientLeftAmount,
        clientRightAmount: formData.clientRightAmount,
      })

      const resClient = await OTCTradeServices.editClientOTCTradeRequest(createdTrade!.tradeUuid, {
        clientUuid: selectedClient?.clientUuid || '',
      })

      refreshTrades()
      setCreatedTrade(resAmounts || resClient)
    } catch (error: any) {
      console.log('ERROR-updateClient', error)
      setServerError(error?.message || 'Failed to update trade')
    } finally {
      setLoadingState(prev => ({
        ...prev,
        updateClientPrice: false,
      }))
    }
  }

  const disableWhileLoading = Object.values(loadingState).some(Boolean)

  // Обработка фокуса для переключения обводки
  const handleFieldFocus = (fieldName: string) => {
    if (fieldName === 'amountRight' || fieldName === 'sideRight') {
      setHighlightDirection('right')
    } else if (fieldName === 'amountLeft' || fieldName === 'sideLeft') {
      setHighlightDirection('left')
    }
  }

  const clientRightAmountHandler = (value: string, isRate = false) => {
    const { clientLeftAmount, rate, side, clientRightAmount, amountLeft, amountRight } = getValues()
    setValue('clientRightAmount', value)
    const clientRate = +value / +clientLeftAmount
    !isRate && setValue('clientRate', clientRate.toString())
    const cf = side === 'BUY' ? 1 : -1
    setValue('markup', (((+clientRate - +rate) / +rate) * 100 * cf).toFixed(3))
  }

  const clientLeftAmountHandler = (value: string, isRate = false) => {
    const { clientRightAmount, rate } = getValues()
    setValue('clientLeftAmount', value)
    const clientRate = (+clientRightAmount / +value).toString()
    !isRate && setValue('clientRate', clientRate)
    setValue('markup', (100 - (+rate / +clientRate) * 100).toFixed(3))
  }

  const isClientAmountLeft = () => {
    const { clientLeftAmount } = getValues()

    return !clientLeftAmount
  }

  const clientRateHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const valueTrimmed = value.replace(',', '.')
    // if (!Number(value)) return
    const { clientRightAmount, clientLeftAmount } = getValues()
    if (isClientLeftAmountBlock) {
      const newClientLeftAmount = (+clientRightAmount / +valueTrimmed).toString()
      setValue('clientLeftAmount', newClientLeftAmount)
      clientLeftAmountHandler(newClientLeftAmount, true)
    } else {
      const newClientRightAmount = (+clientLeftAmount * +valueTrimmed).toString()
      setValue('clientRightAmount', newClientRightAmount)
      clientRightAmountHandler(newClientRightAmount, true)
    }
  }

  return (
    <div className={styles.containerModal}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h2 className={styles.textTitle}>{createdTrade ? `Trade ${createdTrade.tradeUuid}` : 'Create New Trade'}</h2>
        {createdTrade ? (
          <button
            type='button'
            onClick={updateClientPrice}
            style={{ width: 150, alignSelf: 'end', marginRight: 10 }}
            className={styles.addButton}
            disabled={disableWhileLoading}
          >
            {loadingState.updateClientPrice ? <span className='spinner-border' /> : 'Update'}
          </button>
        ) : null}
      </div>
      <div className={clsx(styles.statusBadgeWrap)}>
        <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(createdTrade?.status || '')])}>
          {createdTrade ? getCellValue(createdTrade, 'status') : ''}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Client Selection */}
        <div className={clsx(styles.formRow, styles.gap10)}>
          <div className={styles.formField}>
            <label className={styles.label}>
              Client {loadingState.fetchingClient && <span style={{ fontSize: 12, color: '#999' }}>(loading...)</span>}
            </label>
            <ClientSearch
              value={watch('clientUuid')}
              onChange={value => {
                setValue('clientUuid', value)
                clearErrors()
                setServerError('')
              }}
              onSelect={value => {
                setSelectedClient(value)
                setFetchedClient(null) // Сбрасываем загруженного клиента при новом выборе
                clearErrors()
                setServerError('')
              }}
              error={errors.clientUuid?.message}
              showClearButton={true}
              disabled={loadingState.fetchingClient}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Liquidity Provider</label>
            <LPSearch
              value={watch('liquidityProvider')}
              onChange={value => {
                setValue('liquidityProvider', value)
                setSelectedLP(value)
                clearErrors()
                setServerError('')
              }}
              onSelect={value => {
                setSelectedLP(value)
                setValue('liquidityProvider', value)
                clearErrors()
                setServerError('')
              }}
              error={errors.liquidityProvider?.message}
              // disabled={!!createdTrade && [OTCStatus.CANCELLED, OTCStatus.EXECUTED].includes(createdTrade.status)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Instrument</label>
            <InstrumentSearch
              value={watch('instrument')}
              onChange={value => {
                setValue('instrument', value)
                clearErrors()
                setServerError('')
              }}
              onSelect={value => {
                setSelectedInstrument(value)
                clearErrors()
                setServerError('')
              }}
              error={errors.instrument?.message}
              disabled={!!createdTrade}
            />
          </div>
        </div>

        <div className={clsx(styles.formRow)}>
          {/* Левый блок */}
          <div className={clsx(styles.blockContainer, highlightDirection === 'left' && styles.highlightLeft)}>
            <div className={styles.formField}>
              <label className={styles.label}>Side</label>
              <div className={styles.inputWrapper}>
                <select
                  disabled={!!createdTrade}
                  {...register('side', { required: 'Side is required' })}
                  onFocus={() => {
                    handleFieldFocus('sideLeft')
                    setFocusedField('sideLeft')
                  }}
                  onBlur={() => setFocusedField(null)}
                  className={clsx(styles.select, errors.side && styles.error)}
                >
                  <option value='BUY'>Buy</option>
                  <option value='SELL'>Sell</option>
                </select>
                <div className={styles.dropdownArrow}>▼</div>
              </div>
              {errors.side && <span className={styles.errorMessage}>{errors.side.message}</span>}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Amount {selectedInstrument?.name.substring(0, 3)}</label>
              <div className={styles.inputWrapper}>
                <input
                  // type='number'
                  // step={selectedInstrument?.quantityPrecision || '0.00001'}
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]+([,\.][0-9]+)?'
                  {...register('amountLeft', {
                    min: +(selectedInstrument?.leftMinimumAmount || 0),
                    max: +(selectedInstrument?.leftMaximumAmount || '1000000'),
                  })}
                  onFocus={() => {
                    handleFieldFocus('amountLeft')
                    setFocusedField('amountLeft')
                  }}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => {
                    const raw = e.target.value.replace(',', '.')
                    setValue('amountLeft', raw)
                    // Мгновенно обновляем связанные поля
                    if (!createdTrade && highlightDirection === 'left') {
                      updateRelatedFields('amountLeft')
                    }
                  }}
                  className={clsx(styles.input, errors.amountLeft && styles.error)}
                  placeholder='0'
                  disabled={!!createdTrade}
                />
              </div>
              {errors.amountLeft && <span className={styles.errorMessage}>{errors.amountLeft.message}</span>}
              {selectedInstrument && !errors.amountLeft && !createdTrade && (
                <span className={styles.helpText}>
                  Min: {+selectedInstrument.leftMinimumAmount} | Max: {+selectedInstrument.leftMaximumAmount}
                </span>
              )}
              {selectedInstrument && !errors.amountLeft && !!createdTrade && (
                <span className={styles.helpText}>
                  {(+getValues('amountLeft') * +createdTrade.baseCurrencyToEurRate).toFixed(2)} EUR
                </span>
              )}
            </div>
          </div>

          {/* Центральный блок */}
          <div
            style={{ flexDirection: 'column', maxWidth: 170 }}
            className={clsx(
              styles.blockContainer,
              highlightDirection === 'left' ? styles.centerBlockLeft : styles.centerBlockRight
            )}
          >
            <div className={styles.formField}>
              <label className={styles.label}>Rate</label>
              <div className={styles.inputWrapper}>
                <input
                  type='number'
                  {...register('rate')}
                  className={clsx(styles.input, errors.rate && styles.error)}
                  placeholder='-'
                  disabled={true}
                  readOnly
                />
              </div>
            </div>
            <div style={{ marginTop: 10 }} className={styles.formField}>
              <div className={styles.inputWrapper}>
                <input
                  type='number'
                  step={'0.0001'}
                  {...register('markup')}
                  className={clsx(styles.input, errors.rate && styles.error)}
                  placeholder='-'
                  disabled={!!createdTrade}
                />
              </div>
              <label className={styles.label}>Markup %</label>
            </div>
          </div>

          {/* Правый блок */}
          <div className={clsx(styles.blockContainer, highlightDirection === 'right' && styles.highlightRight)}>
            <div className={styles.formField}>
              <label className={styles.label}>Amount {selectedInstrument?.name?.slice(-3) || ''}</label>
              <div className={styles.inputWrapper}>
                <input
                  // type='number'
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]+([,\.][0-9]+)?'
                  step={selectedInstrument?.quantityPrecision || '0.0001'}
                  {...register('amountRight')}
                  onFocus={() => {
                    handleFieldFocus('amountRight')
                    setFocusedField('amountRight')
                  }}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => {
                    const raw = e.target.value.replace(',', '.')
                    setValue('amountRight', raw)
                    // Мгновенно обновляем связанные поля
                    if (!createdTrade && highlightDirection === 'right') {
                      updateRelatedFields('amountRight')
                    }
                  }}
                  className={clsx(styles.input, errors.amountRight && styles.error)}
                  placeholder='0'
                  disabled={!!createdTrade}
                />
              </div>
              {errors.amountRight && <span className={styles.errorMessage}>{errors.amountRight.message}</span>}
              {selectedInstrument && !errors.amountRight && !createdTrade && (
                <span className={styles.helpText}>
                  Min: {+selectedInstrument.rightMinimumAmount} | Max: {+selectedInstrument.rightMaximumAmount}
                </span>
              )}
              {selectedInstrument && !errors.amountLeft && !!createdTrade && (
                <span className={styles.helpText}>
                  {(+getValues('amountRight') * +createdTrade.counterCurrencyToEurRate).toFixed(2)} EUR
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Side</label>
              <div className={styles.inputWrapper}>
                <select
                  disabled={!!createdTrade}
                  {...register('sideRight', { required: 'Side is required' })}
                  onFocus={() => {
                    handleFieldFocus('sideRight')
                    setFocusedField('sideRight')
                  }}
                  onBlur={() => setFocusedField(null)}
                  className={clsx(styles.select, errors.sideRight && styles.error)}
                >
                  <option value='SELL'>Sell</option>
                  <option value='BUY'>Buy</option>
                </select>
                <div className={styles.dropdownArrow}>▼</div>
              </div>
              {errors.sideRight && <span className={styles.errorMessage}>{errors.sideRight.message}</span>}
            </div>
          </div>
        </div>

        <div className={clsx(styles.formRow, styles.gap10)}>
          <>
            <div className={styles.formField}>
              <label className={styles.label}>
                Client Amount {selectedInstrument?.name.slice(0, 3)}{' '}
                <img
                  onClick={() => setIsClientLeftAmountBlock(!isClientLeftAmountBlock)}
                  style={{
                    height: 15,
                    marginBottom: 2,
                    marginLeft: 5,
                    cursor: 'pointer',
                    display: createdTrade ? 'inline-block' : 'none',
                  }}
                  src={isClientLeftAmountBlock ? lock : unlock}
                  alt={''}
                />
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type='number'
                  step='0.000001'
                  {...register('clientLeftAmount')}
                  onFocus={() => setFocusedField('clientLeftAmount')}
                  onBlur={() => setFocusedField(null)}
                  className={clsx(styles.input, errors.clientLeftAmount && styles.error)}
                  placeholder='-'
                  disabled={!createdTrade || isClientLeftAmountBlock}
                  onChange={e => clientLeftAmountHandler(e.target?.value)}
                />
              </div>
              {errors.clientLeftAmount && (
                <span className={styles.errorMessage}>{errors.clientLeftAmount.message}</span>
              )}
              {selectedInstrument && !errors.clientLeftAmount && !!createdTrade && (
                <span className={styles.helpText}>
                  {(+watch('clientLeftAmount') * +createdTrade.baseCurrencyToEurRate).toFixed(2)} EUR
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Client Rate</label>
              <div className={styles.inputWrapper}>
                <input
                  // type='number'
                  {...register('clientRate')}
                  className={clsx(styles.input, errors.clientRate && styles.error)}
                  placeholder='-'
                  disabled={!createdTrade}
                  // disabled={true}
                  // readOnly
                  onChange={clientRateHandler}
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>
                Client Amount {selectedInstrument?.name?.slice(-3) || ''}
                <img
                  onClick={() => setIsClientLeftAmountBlock(!isClientLeftAmountBlock)}
                  style={{
                    height: 15,
                    marginBottom: 2,
                    marginLeft: 5,
                    cursor: 'pointer',
                    display: createdTrade ? 'inline-block' : 'none',
                  }}
                  src={isClientLeftAmountBlock ? unlock : lock}
                  alt={''}
                />
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type='number'
                  step='0.000001'
                  {...register('clientRightAmount')}
                  onFocus={() => setFocusedField('clientRightAmount')}
                  onBlur={() => setFocusedField(null)}
                  className={clsx(styles.input, errors.clientRightAmount && styles.error)}
                  placeholder='-'
                  disabled={!createdTrade || !isClientLeftAmountBlock}
                  onChange={e => clientRightAmountHandler(e.target?.value)}
                />
              </div>
              {errors.clientRightAmount && (
                <span className={styles.errorMessage}>{errors.clientRightAmount.message}</span>
              )}
              {selectedInstrument && !errors.clientRightAmount && !!createdTrade && (
                <span className={styles.helpText}>
                  {(+watch('clientRightAmount') * +createdTrade.counterCurrencyToEurRate).toFixed(2)} EUR
                </span>
              )}
            </div>
          </>
        </div>

        {createdTrade ? null : (
          <div className={styles.buttonRow}>
            <button
              type='submit'
              className={styles.submitButton}
              disabled={isClientAmountLeft() || disableWhileLoading}
            >
              {loadingState.onSubmit ? 'Saving...' : 'Execute Trade'}
            </button>
          </div>
        )}

        {serverError && (
          <div className={styles.serverError}>
            {serverError === 'UNKNOWN' ? 'Provider error occurred. Try later.' : serverError}
          </div>
        )}
      </form>

      {/* Comments Section */}
      {createdTrade && <TradeComment tradeData={createdTrade} />}
    </div>
  )
}
