import cryptoES from 'crypto-es'

export const hash = (message: string): string => cryptoES.SHA1(message).toString()
