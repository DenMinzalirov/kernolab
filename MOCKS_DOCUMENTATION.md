# Полная документация по мок-данным (MOCK)

Этот документ содержит полный список всех мок-данных, применяемых в проекте для внутреннего тестирования и разработки.

## ⚠️ ВАЖНО

**Перед деплоем на продакшн необходимо:**
1. Проверить все файлы из списка ниже
2. Удалить или закомментировать все мок-данные
3. Убедиться, что приложение работает без моков
4. Протестировать функциональность
5. Восстановить обработку ошибок (раскомментировать `handleError` где необходимо)

---

## 📋 Список всех мок-данных по категориям

### 🔐 Карты (Cards)

#### 1. `src/model/cefi-banking.ts`

**Методы:**
- `getCardsDataFx` - получение списка активных карт
- `getCardsBalanceFx` - получение баланса карты
- `getCardAccountLimitsFx` - получение лимитов счета

**Мок-данные:**

**Виртуальная карта (`cardInfoMockVirtual`):**
- `cardUuid`: `'456e7890-e12b-34c5-d678-901234567890'`
- `type`: `ECardType.VIRTUAL`
- `maskedCardNumber`: `'**** **** **** 5678'`
- `expiryDate`: `'12/27'`
- `status`: `ECardStatus.ACTIVE`
- Лимиты: daily/weekly/monthly для Purchase, Withdrawal, Internet, Contactless, Overall

**Физическая карта (`cardInfoMockPhysical`):**
- `cardUuid`: `'123e4567-e89b-12d3-a456-426614174000'`
- `type`: `ECardType.CHIP_AND_PIN`
- `maskedCardNumber`: `'**** **** **** 1234'`
- `expiryDate`: `'12/26'`
- `status`: `ECardStatus.ACTIVE`
- Лимиты: daily/weekly/monthly для Purchase, Withdrawal, Internet, Contactless, Overall
- `deliveryAddress`: полный адрес доставки
- `embossingName`: `'JOHN DOE'`

**Баланс карты (`mockCardsBalance`):**
- Значение: `'434.16'` (строка)

**Лимиты счета (`mockAccountLimits`):**
```typescript
{
  dailyInternetPurchase: 5000,
  dailyContactlessPurchase: 1000,
  monthlyInternetPurchase: 60000,
  monthlyContactlessPurchase: 30000
}
```

**Механизм:** Effector `sample` + `failData` - автоматическая установка при ошибке

**Строки:**
- 13-127: Мок-данные карт
- 148-153: Мок-лимиты счета
- 155: Мок-баланс
- 177-184: Установка мок-карт при ошибке
- 187-193: Автоматический выбор виртуальной карты
- 204-211: Установка мок-баланса при ошибке
- 226-233: Установка мок-лимитов при ошибке

---

#### 2. `src/features/modals/card-view-details/index.tsx`

**Метод:** `CardService.cardDetails` - получение деталей карты (номер, CVV2)

**Мок-данные:**
- `cardNumber`: `'4532123456789012'`
- `cvv2`: `'873'`
- `embossingName`: из `currentCard` или `'JOHN DOE'`
- `expiryDate`: `'2030-08-15T00:00:00.000Z'` (fallback, отображается как 08/30)

**Механизм:** catch блок в функции `getCardsData`

**Строки:**
- 30: Мок-дата действия карты (fallback)
- 80-88: Мок-данные в catch блоке

---

#### 3. `src/features/card-settings/card-limits.tsx`

**Метод:** `CardService.getCardLimits(cardUuid)` - получение лимитов карты

**Мок-данные (`mockCardLimits`):**
```typescript
{
  dailyPurchase: { total: 8000, used: 1700, available: 6300 },
  dailyWithdrawal: { total: 2000, used: 500, available: 1500 },
  dailyInternetPurchase: { total: 5000, used: 1000, available: 4000 },
  dailyContactlessPurchase: { total: 1000, used: 200, available: 800 },
  dailyOverallPurchase: { total: 7000, used: 1200, available: 5800 },
  weeklyPurchase: { total: 30000, used: 10000, available: 20000 },
  weeklyWithdrawal: { total: 5000, used: 1000, available: 4000 },
  weeklyInternetPurchase: { total: 15000, used: 5000, available: 10000 },
  weeklyContactlessPurchase: { total: 7000, used: 1700, available: 5300 },
  weeklyOverallPurchase: { total: 25000, used: 7000, available: 18000 },
  monthlyPurchase: { total: 120000, used: 30000, available: 90000 },
  monthlyWithdrawal: { total: 10000, used: 2000, available: 8000 },
  monthlyInternetPurchase: { total: 60000, used: 15000, available: 45000 },
  monthlyContactlessPurchase: { total: 30000, used: 5000, available: 25000 },
  monthlyOverallPurchase: { total: 100000, used: 25000, available: 75000 },
  transactionPurchase: 0,
  transactionWithdrawal: 0,
  transactionInternetPurchase: 0,
  transactionContactlessPurchase: 0
}
```

**Механизм:** catch блок в `useEffect`

**Строки:**
- 36-58: Мок-данные в catch блоке

---

#### 4. `src/features/card-settings/card-fees.tsx`

**Методы:**
- `CardService.getCardFees(cardUuid)` - получение комиссий карты
- `CardService.getFeesInfo()` - получение информации о комиссиях

**Мок-данные:**

**Комиссии карты (`mockCardFees`):**
```typescript
[
  { type: 'AUTHORIZATION_FIXED_FEE', fixedPart: 0.5, percentagePart: 0, minAmount: 0 },
  { type: 'AUTHORIZATION_ATM_WITHDRAWAL_FIXED_FEE', fixedPart: 2.5, percentagePart: 0, minAmount: 0 },
  { type: 'AUTHORIZATION_ATM_WITHDRAWAL_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 1.5, minAmount: 0 },
  { type: 'PAYMENT_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 0.3, minAmount: 0 },
  { type: 'PAYMENT_EEA_FIXED_FEE', fixedPart: 0, percentagePart: 0, minAmount: 0 },
  { type: 'AUTHORIZATION_DECLINED_FIXED_FEE', fixedPart: 0, percentagePart: 0, minAmount: 0 },
  { type: 'CARD_USAGE_FIXED_FEE', fixedPart: 1.0, percentagePart: 0, minAmount: 0 },
  { type: 'AUTHORIZATION_FOREIGN_EXCHANGE_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 2.0, minAmount: 0 }
]
```

**Информация о комиссиях (`mockFeesInfo`):**
- 8 записей с названиями и описаниями для каждого типа комиссии

**Механизм:** catch блок в функции `fetchFeesData`

**Строки:**
- 56-111: Мок-данные в catch блоке

---

#### 5. `src/features/card-security/index.tsx`

**Методы:**
- `CardService.getCard3DPassword` - получение 3DS пароля
- `CardService.getCardPin` - получение PIN карты

**Мок-данные:**
- PIN: `'1234'`
- 3DS Password: `'ABC123XYZ'`

**Механизм:** catch блок в функции `getCardsData`

**Строки:**
- 77-80: Мок-данные в catch блоке

---

### 💰 Криптовалюты (Crypto)

#### 6. `src/model/cefi-crypto-deposit-withdraw-assets.ts`

**Метод:** `AssetsServices.getCryptoDepositWithdrawal()` - получение списка активов для депозита/вывода

**Мок-данные (`mockCryptoDepositWithdrawAssets`):**
```typescript
[
  {
    assetId: 'BTC',
    networks: [
      {
        networkId: 'BTC',
        minimumDepositAmount: '0.001',
        minimumWithdrawalAmount: '0.002',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false
      }
    ]
  },
  {
    assetId: 'ETH',
    networks: [
      {
        networkId: 'ETH',
        minimumDepositAmount: '0.01',
        minimumWithdrawalAmount: '0.02',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false
      },
      {
        networkId: 'BNB',
        minimumDepositAmount: '0.01',
        minimumWithdrawalAmount: '0.02',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false
      }
    ]
  },
  {
    assetId: 'USDT',
    networks: [
      {
        networkId: 'ETH',
        minimumDepositAmount: '10.0',
        minimumWithdrawalAmount: '20.0',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false
      },
      {
        networkId: 'TRX',
        minimumDepositAmount: '10.0',
        minimumWithdrawalAmount: '20.0',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: true
      }
    ]
  }
]
```

**Механизм:** Effector `sample` + `failData` - автоматическая установка при ошибке

**Строки:**
- 6-62: Константа с мок-данными
- 87-91: Установка мок-данных при ошибке

---

#### 7. `src/features/deposit-asset/index.tsx`

**Метод:** `CryptoDepositsServices.getCryptoAddressForAsset(assetId, networkId)` - получение адреса для депозита

**Мок-данные:**

**ETH адреса (5 штук, выбирается случайно):**
- `'0x34aa448f6d580D095DBDF756cf3fFB8FB3eD6e6a'`
- `'0x4d09D15d0678D9e154e204b0703151D0a13d9806'`
- `'0xb9700D77a69D760aE9FC0A425D3768fD37aE7de2'`
- `'0x0098D603C085Bc7d6cA152565fab9F1059eaCc3C'`
- `'0x2CDf95833387B2555b842a99614f888b3383d3e7'`

**TRX адреса (2 штуки, выбирается случайно):**
- `'TTDAKTrVgcZYupxMX455ioKsAX9Q3Ci5tJ'`
- `'TGEFCgHwBHXQQyZsaYv4E8rSshj6HrCAeo'`

**Механизм:** catch блок в функции `getCoinAddress`, случайный выбор адреса

**Строки:**
- 49-78: Мок-данные в catch блоке

---

#### 8. `src/features/modals/deposit-asset/index.tsx`

**Метод:** `CryptoDepositsServices.getCryptoAddressForAsset(assetId, networkId)` - получение адреса для депозита

**Мок-данные:** Те же, что и в `src/features/deposit-asset/index.tsx`

**Механизм:** catch блок в функции `getCoinAddress`, случайный выбор адреса

**Строки:**
- 42-78: Мок-данные в catch блоке

---

#### 9. `src/features/modals/withdraw-asset/index.tsx`

**Методы:**
- `AssetsServices.withdrawalInfoRequest()` - получение информации о выводе
- `AssetsServices.withdrawalAsset()` - выполнение вывода
- `WhitListServices.addAddressWhitelist()` - добавление адреса в whitelist

**Мок-данные:**

**В функции `getWithdrawalInfo` (строка 173):**
```typescript
{
  assetId: asset?.assetId ?? '',
  networkId: selectedNetwork?.networkId ?? '',
  amount: вычисленное значение,
  fee: '0.001',
  destinationAddress: watchAddress,
  destinationTag: watchMemo,
  addToWhitelist: false
}
```

**В функции `handleFinalAction` (строка 223):**
- При `step === STEPS.SUMMARY`: имитация успешного вывода (устанавливает `isSuccessful`, вызывает `initApp`)
- Иначе: имитация успешного добавления в whitelist (вызывает `getWhiteListFx()`, `getWithdrawalInfo()`, устанавливает `step = SUMMARY`)

**Механизм:** catch блоки в функциях

**Строки:**
- 172-184: Мок в `getWithdrawalInfo`
- 223-244: Мок в `handleFinalAction`

---

## 📊 Сводная таблица всех мок-данных

| Файл | Метод/API | Тип данных | Механизм | Строки |
|------|-----------|------------|----------|--------|
| `src/model/cefi-banking.ts` | `getCardsDataFx` | `BasicCardInfo[]` | Effector `sample` + `failData` | 177-184 |
| `src/model/cefi-banking.ts` | `getCardsBalanceFx` | `string` | Effector `sample` + `failData` | 204-211 |
| `src/model/cefi-banking.ts` | `getCardAccountLimitsFx` | `AccountLimitsResponse` | Effector `sample` + `failData` | 226-233 |
| `src/model/cefi-crypto-deposit-withdraw-assets.ts` | `getCryptoDepositWithdrawal` | `AssetWithNetworks[]` | Effector `sample` + `failData` | 87-91 |
| `src/features/deposit-asset/index.tsx` | `getCryptoAddressForAsset` | `WalletAddressResponse` | catch блок | 49-78 |
| `src/features/modals/deposit-asset/index.tsx` | `getCryptoAddressForAsset` | `WalletAddressResponse` | catch блок | 42-78 |
| `src/features/modals/withdraw-asset/index.tsx` | `withdrawalInfoRequest` | `WithdrawalOffer` | catch блок | 172-184 |
| `src/features/modals/withdraw-asset/index.tsx` | `withdrawalAsset` / `addAddressWhitelist` | Имитация успеха | catch блок | 223-244 |
| `src/features/modals/card-view-details/index.tsx` | `cardDetails` | `{cardNumber, cvv2, embossingName}` | catch блок | 80-88 |
| `src/features/modals/card-view-details/index.tsx` | - | `expiryDate` (fallback) | fallback значение | 30 |
| `src/features/card-settings/card-limits.tsx` | `getCardLimits` | `CardLimitsResponse` | catch блок | 36-58 |
| `src/features/card-settings/card-fees.tsx` | `getCardFees` + `getFeesInfo` | `MergedFee[]` | catch блок | 56-111 |
| `src/features/card-security/index.tsx` | `getCard3DPassword` / `getCardPin` | `string` (пароль) | catch блок | 77-80 |

---

## 🔍 Детальное описание мок-данных

### Криптовалютные активы

**Файл:** `src/model/cefi-crypto-deposit-withdraw-assets.ts`

**Структура данных:**
- 3 актива: BTC, ETH, USDT
- BTC: 1 сеть (BTC)
- ETH: 2 сети (ETH, BNB)
- USDT: 2 сети (ETH, TRX)

**Использование:** Fallback при ошибке получения списка активов

---

### Адреса для депозита

**Файлы:** 
- `src/features/deposit-asset/index.tsx`
- `src/features/modals/deposit-asset/index.tsx`

**Логика:**
- Определение сети по `networkId.toUpperCase()`
- Для ETH: случайный выбор из 5 адресов
- Для TRX: случайный выбор из 2 адресов
- Для других сетей: показывается ошибка

**Структура ответа:**
```typescript
{
  addresses: [{
    addressType: 'ADDRESS',
    address: string, // случайный адрес
    tag: ''
  }]
}
```

---

### Информация о выводе

**Файл:** `src/features/modals/withdraw-asset/index.tsx`

**Мок-данные:**
- Используются реальные значения из формы (`assetId`, `networkId`, `amount`, `address`, `memo`)
- `fee`: фиксированное значение `'0.001'`
- `addToWhitelist`: `false`

**Имитация успешного вывода:**
- Устанавливается `isSuccessful = true`
- Вызывается `initApp()`
- НЕ вызывается `myLogEvent` (закомментирован)
- НЕ вызывается `handleError` (закомментирован)

---

### Данные карт

**Виртуальная карта:**
- UUID: `'456e7890-e12b-34c5-d678-901234567890'`
- Номер: `'**** **** **** 5678'`
- Срок действия: `'12/27'`
- Без адреса доставки (`deliveryAddress: null`)

**Физическая карта:**
- UUID: `'123e4567-e89b-12d3-a456-426614174000'`
- Номер: `'**** **** **** 1234'`
- Срок действия: `'12/26'`
- Полный адрес доставки в США
- Имя на карте: `'JOHN DOE'`

---

### Лимиты карты

**Daily лимиты:**
- Purchase: 8000 EUR (использовано: 1700, доступно: 6300)
- Withdrawal: 2000 EUR (использовано: 500, доступно: 1500)
- Internet Purchase: 5000 EUR (использовано: 1000, доступно: 4000)
- Contactless Purchase: 1000 EUR (использовано: 200, доступно: 800)
- Overall Purchase: 7000 EUR (использовано: 1200, доступно: 5800)

**Weekly лимиты:**
- Purchase: 30000 EUR (использовано: 10000, доступно: 20000)
- Withdrawal: 5000 EUR (использовано: 1000, доступно: 4000)
- Internet Purchase: 15000 EUR (использовано: 5000, доступно: 10000)
- Contactless Purchase: 7000 EUR (использовано: 1700, доступно: 5300)
- Overall Purchase: 25000 EUR (использовано: 7000, доступно: 18000)

**Monthly лимиты:**
- Purchase: 120000 EUR (использовано: 30000, доступно: 90000)
- Withdrawal: 10000 EUR (использовано: 2000, доступно: 8000)
- Internet Purchase: 60000 EUR (использовано: 15000, доступно: 45000)
- Contactless Purchase: 30000 EUR (использовано: 5000, доступно: 25000)
- Overall Purchase: 100000 EUR (использовано: 25000, доступно: 75000)

**Transaction лимиты:** все равны 0

---

### Комиссии карты

**Типы комиссий:**
1. `AUTHORIZATION_FIXED_FEE` - 0.5 EUR (фиксированная)
2. `AUTHORIZATION_ATM_WITHDRAWAL_FIXED_FEE` - 2.5 EUR (фиксированная)
3. `AUTHORIZATION_ATM_WITHDRAWAL_PERCENTAGE_FEE` - 1.5% (процентная)
4. `PAYMENT_PERCENTAGE_FEE` - 0.3% (процентная)
5. `PAYMENT_EEA_FIXED_FEE` - 0 EUR
6. `AUTHORIZATION_DECLINED_FIXED_FEE` - 0 EUR
7. `CARD_USAGE_FIXED_FEE` - 1.0 EUR (фиксированная)
8. `AUTHORIZATION_FOREIGN_EXCHANGE_PERCENTAGE_FEE` - 2.0% (процентная)

---

## 🛠️ Механизмы применения моков

### 1. Effector (рекомендуемый подход)

**Используется в:**
- `src/model/cefi-banking.ts`
- `src/model/cefi-crypto-deposit-withdraw-assets.ts`

**Преимущества:**
- Декларативный подход
- Автоматическая установка при ошибке
- Соответствие архитектуре проекта

**Пример:**
```typescript
sample({
  clock: effectFx.failData,
  fn: () => mockData,
  target: $store
})
```

### 2. Catch блоки

**Используется в:**
- Все остальные файлы

**Преимущества:**
- Простота реализации
- Прямой контроль над логикой

**Пример:**
```typescript
try {
  const data = await service.getData()
  setData(data)
} catch (error) {
  // MOCK: Для внутреннего тестирования и разработки
  setData(mockData)
}
```

---

## ✅ Чек-лист перед продакшн деплоем

### Критично (удалить обязательно):

- [ ] `src/model/cefi-crypto-deposit-withdraw-assets.ts` - строки 6-62, 87-91
- [ ] `src/model/cefi-banking.ts` - строки 13-127, 148-155, 177-233
- [ ] `src/features/deposit-asset/index.tsx` - строки 49-78
- [ ] `src/features/modals/deposit-asset/index.tsx` - строки 42-78
- [ ] `src/features/modals/withdraw-asset/index.tsx` - строки 172-184, 223-244
- [ ] `src/features/modals/card-view-details/index.tsx` - строки 30, 80-88
- [ ] `src/features/card-settings/card-limits.tsx` - строки 36-58
- [ ] `src/features/card-settings/card-fees.tsx` - строки 56-111
- [ ] `src/features/card-security/index.tsx` - строки 77-80

### Восстановить обработку ошибок:

- [ ] Раскомментировать `handleError(error)` в `src/features/modals/withdraw-asset/index.tsx` (строки 183, 245)
- [ ] Раскомментировать `setRequestError(e.code)` в `src/features/modals/card-view-details/index.tsx` (строка 89)
- [ ] Проверить обработку ошибок во всех catch блоках

### Опционально (закомментированные моки):

- [ ] `src/model/cefi-banking.ts` - строки 161-164 (закомментированный код)
- [ ] `src/features/modals/fancy-physical-card/index.tsx` - строки 42-62 (закомментированные моки)
- [ ] `src/features/auth-new/sign-in/index.tsx` - строка 123 (комментарий)
- [ ] `src/fideumOTC/model/clients-fideumOTC.ts` - строки 11-30 (неиспользуемые данные)
- [ ] `src/xanova/features/dashboard-xanova/index.tsx` - строка 42 (закомментированное изображение)

---

## 🔍 Команды для поиска всех моков

```bash
# Поиск по ключевым словам
grep -r "MOCK\|mock\|Mock\|MOC" src/ --include="*.ts" --include="*.tsx"

# Поиск TODO с упоминанием моков
grep -r "TODO.*mock\|TODO.*MOCK" src/ --include="*.ts" --include="*.tsx" -i

# Поиск catch блоков с моками
grep -r "catch.*MOCK\|MOCK.*catch" src/ --include="*.ts" --include="*.tsx" -A 5
```

---

## 📝 Примечания

1. **Effector моки** автоматически устанавливаются при ошибке через механизм `failData` - это позволяет приложению продолжать работу без явной обработки ошибок в компонентах.

2. **Catch блоки** требуют явной установки мок-данных и могут скрывать реальные ошибки - убедитесь, что после удаления моков ошибки будут корректно обрабатываться.

3. **Случайные адреса** для депозита выбираются при каждом запросе - это позволяет тестировать разные адреса.

4. **Имитация успешных операций** в `withdraw-asset` может скрывать проблемы с API - после удаления моков убедитесь, что операции действительно выполняются.

5. **Мок-пароли** (PIN и 3DS) используются только для демонстрации - НЕ использовать в продакшне.

---

## 📅 История изменений

**Версия 2.0** - 2025-01-XX
- Добавлены моки для карт (лимиты, комиссии, детали, пароли)
- Добавлены моки для криптовалют (депозит, вывод)
- Обновлена документация

**Версия 1.0** - 2025-01-XX
- Первоначальная версия документации

---

**Дата последнего обновления:** 2025-01-XX  
**Версия документа:** 2.0
