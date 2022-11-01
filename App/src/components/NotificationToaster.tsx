import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { removeNotification } from '@actions/Notification'
import { Arrays } from '@utils/Immutable'

import { RootState } from '@store'

const NOTIFICATION_TIMEOUT = 3000
const MAX_NOTIFICATIONS = 5


class Toast {
  private shift: number = 0
  private message: string = ''

  public constructor(message = '', shift = -200) {
    this.message = message
    this.shift = shift
  }

  public getMessage(): string {
    return this.message
  }

  public getShift(): number {
    return this.shift
  }
}

const NotificationToaster = (): JSX.Element => {
  const dispatch = useDispatch()

  const notifications = useSelector((state: RootState) => state.notifications)

  const [ currentIndex, setCurrentIndex ] = useState(0)
  const [ lastSize, setLastSize ] = useState(0)
  const [ notificationState, setNotificationState ] = useState(Array<Toast>(MAX_NOTIFICATIONS).fill(new Toast()))
  const notificationStateRef = useRef(notificationState)
  notificationStateRef.current = notificationState

  useEffect(() => {
    if (notifications.length > lastSize) {
      const nextIndex = (currentIndex + 1) % notifications.length
      setCurrentIndex(nextIndex)
      setNotificationState(Arrays.updateAt(notificationState, new Toast(notifications[nextIndex].getMessage(), 0), nextIndex))

      setTimeout(() => {
        setNotificationState(Arrays.updateAt(notificationStateRef.current, new Toast(notifications[nextIndex].getMessage()), nextIndex))
        dispatch(removeNotification(notifications[nextIndex]))
      }, NOTIFICATION_TIMEOUT)
    }
    setLastSize(notifications.length)
  }, [ dispatch, currentIndex, notifications, notificationState, notificationStateRef ])

  const notificationToasters = []

  for (let i = 0; i < MAX_NOTIFICATIONS; i++) {
    notificationToasters[MAX_NOTIFICATIONS - i] = (
      <div key={i} className="notificationToaster" id={`toaster-${i}`} style={{ transform: `translateX(${notificationState[i].getShift()}px)` }}>
        { notificationState[i].getMessage() }
      </div>
    )
  }

  return <div className="notificationToasters">
    {notificationToasters}
  </div>
}

export default NotificationToaster