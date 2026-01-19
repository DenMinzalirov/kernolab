import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import { OTCTrade, OTCTradeServices } from '../../wip/services/fideumOTC-services/OTC-trade'
import styles from './styles.module.scss'

interface TradeCommentProps {
  tradeData?: OTCTrade | null
  client?: string
}

export function TradeComment({ tradeData, client }: TradeCommentProps) {
  const [comment, setComment] = useState('')
  const [originalComment, setOriginalComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const getTradeComment = async (tradeDataItem: OTCTrade) => {
    try {
      const data = await OTCTradeServices.getTradeComment(tradeDataItem.tradeUuid)
      data.comment && setComment(data.comment)
    } catch (e) {
      console.log('ERROR-getTradeComment', e)
    }
  }

  const getClintComment = async (clientUuid: string) => {
    try {
      const data = await OTCTradeServices.getClientComment(clientUuid)
      data.comment && setComment(data.comment)
    } catch (e) {
      console.log('ERROR-getClintComment', e)
    }
  }

  useEffect(() => {
    if (client) {
      getClintComment(client).then(_ => null)
    } else {
      if (tradeData) getTradeComment(tradeData).then(_ => null)
    }
  }, [tradeData, client])

  const hasChanges = comment !== originalComment
  const isEmpty = comment?.trim() === ''

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setComment(originalComment)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      if (client) {
        await OTCTradeServices.saveClientComment(client, { comment })
      } else {
        if (!tradeData?.tradeUuid) return
        await OTCTradeServices.saveTradeComment(tradeData.tradeUuid, { comment })
      }

      setOriginalComment(comment)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save comment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      await handleSave()
    }
  }

  return (
    <div className={styles.commentContainer}>
      <div
        // onClick={() => setIsShowComment(!isShowComment)}
        className={styles.commentHeader}
      >
        <h4 className={styles.commentTitle}>Comments</h4>
        {!isEditing && !isEmpty && (
          <button type='button' onClick={handleEdit} className={styles.editButton}>
            Edit
          </button>
        )}
      </div>

      <div
        // style={isShowComment ? {} : { display: 'none' }}
        className={styles.commentContent}
      >
        {isEditing ? (
          <div className={styles.commentEdit}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.commentTextarea}
              placeholder='Add a comment...'
              disabled={isSaving}
              rows={3}
            />
            <div className={styles.commentActions}>
              <button type='button' onClick={handleCancel} className={styles.cancelButton} disabled={isSaving}>
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSave}
                className={styles.saveButton}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.commentDisplay}>
            {isEmpty ? (
              <div className={styles.emptyComment}>
                <span className={styles.emptyText}>No comments yet</span>
                <button type='button' onClick={handleEdit} className={styles.addButton}>
                  Add Comment
                </button>
              </div>
            ) : (
              <div className={styles.commentText} onClick={handleEdit}>
                {comment}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
