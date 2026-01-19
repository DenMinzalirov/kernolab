import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

import styles from './styles.module.scss'

interface SignatureData {
  name: string
  base64: string
  type: string
  size: number
}

interface DigitalSignaturesProps {
  onSignature1Change: (signatureData: SignatureData | null) => void
  onSignature2Change: (signatureData: SignatureData | null) => void
  signature1Error?: boolean
  signature2Error?: boolean
}

export function DigitalSignatures({
  onSignature1Change,
  onSignature2Change,
  signature1Error,
  signature2Error,
}: DigitalSignaturesProps) {
  const sigCanvas1 = useRef<SignatureCanvas>(null)
  const sigCanvas2 = useRef<SignatureCanvas>(null)

  const [signature1, setSignature1] = useState<SignatureData | null>(null)
  const [signature2, setSignature2] = useState<SignatureData | null>(null)

  const handleSignatureEnd = (
    canvas: React.RefObject<SignatureCanvas | null>,
    signatureName: string,
    setSignature: (signatureData: SignatureData | null) => void,
    onChange: (signatureData: SignatureData | null) => void
  ) => {
    if (canvas.current) {
      // Получаем base64 напрямую
      const base64 = canvas.current.toDataURL('image/png')

      // Конвертируем base64 в blob для получения размера
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const signatureData: SignatureData = {
            name: signatureName,
            base64: base64,
            type: 'image/png',
            size: blob.size,
          }
          setSignature(signatureData)
          onChange(signatureData)
        })
    }
  }

  const handleClearSignature = (
    canvas: React.RefObject<SignatureCanvas | null>,
    setSignature: (signatureData: SignatureData | null) => void,
    onChange: (signatureData: SignatureData | null) => void
  ) => {
    if (canvas.current) {
      canvas.current.clear()
      setSignature(null)
      onChange(null)
    }
  }

  return (
    <div className={styles.signatureWrap}>
      {/* Первая подпись */}
      <div className={styles.signatureBlock}>
        <div className={styles.signatureTitle}>Signature 1 *</div>
        <div className={styles.signatureDescription}>
          Please provide your digital signature to authorize your application.
        </div>

        <div className={styles.signatureCanvasWrap} style={{ borderColor: signature1Error ? '#ff4d4f' : undefined }}>
          {signature1 && (
            <button
              type='button'
              onClick={() => handleClearSignature(sigCanvas1, setSignature1, onSignature1Change)}
              className={styles.signatureClearBtn}
            >
              ✕
            </button>
          )}
          <SignatureCanvas
            ref={sigCanvas1}
            penColor='#000'
            backgroundColor='white'
            canvasProps={{
              className: styles.signatureCanvas,
            }}
            onEnd={() => handleSignatureEnd(sigCanvas1, 'signature1.png', setSignature1, onSignature1Change)}
          />
        </div>
        {signature1Error && <div className={styles.signatureError}>Signature is required</div>}
      </div>

      {/* Вторая подпись */}
      <div className={styles.signatureBlock}>
        <div className={styles.signatureTitle}>Signature 2 *</div>
        <div className={styles.signatureDescription}>Second signature required for validation.</div>

        <div className={styles.signatureCanvasWrap} style={{ borderColor: signature2Error ? '#ff4d4f' : undefined }}>
          {signature2 && (
            <button
              type='button'
              onClick={() => handleClearSignature(sigCanvas2, setSignature2, onSignature2Change)}
              className={styles.signatureClearBtn}
            >
              ✕
            </button>
          )}
          <SignatureCanvas
            ref={sigCanvas2}
            penColor='#000'
            backgroundColor='white'
            canvasProps={{
              className: styles.signatureCanvas,
            }}
            onEnd={() => handleSignatureEnd(sigCanvas2, 'signature2.png', setSignature2, onSignature2Change)}
          />
        </div>
        {signature2Error && <div className={styles.signatureError}>Signature is required</div>}
      </div>
    </div>
  )
}
