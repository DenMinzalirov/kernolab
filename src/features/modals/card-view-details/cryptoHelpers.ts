// import { Buffer } from 'buffer'

export const generateKeyPair = (): Promise<CryptoKeyPair> => {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt', 'decrypt']
  )
}

const arrayBufferToPem = (buffer: ArrayBuffer, type: string): string => {
  // @ts-ignore
  const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
  let pem = `-----BEGIN ${type} KEY-----\n`
  let nextIndex = 0
  const lineLength = 64

  while (nextIndex < base64.length) {
    pem += `${base64.slice(nextIndex, nextIndex + lineLength)}\n`
    nextIndex += lineLength
  }

  pem += `-----END ${type} KEY-----\n`
  return pem
}

export const getPublicKeyPem = async (publicKey: CryptoKey): Promise<string> => {
  const publicKeyAb = await window.crypto.subtle.exportKey('spki', publicKey)
  return arrayBufferToPem(publicKeyAb, 'PUBLIC KEY')
}

export const preparedEncrypt = (data: string): string => {
  const preparedData = data.split('\n')
  return preparedData.slice(1, -2).join('\n')
}

export const decryptedData = async (privateKey: CryptoKey, encryptedData: string, label: string): Promise<string> => {
  // Декодируем строку Base64 в строку двоичных данных
  const binaryString = window.atob(encryptedData)

  // Преобразуем строку в массив байтов
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
      label: new TextEncoder().encode(label), // Provide the OAEP label here
    },
    privateKey,
    bytes
    // Buffer.from(encryptedData, 'base64')
  )

  return new TextDecoder().decode(decryptedArrayBuffer)
}
