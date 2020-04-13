import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { removeNotification } from '@actions/Notification'

import { RootState } from '@store'

const NOTIFICATION_TIMEOUT = 3000

const NotificationToaster = (): JSX.Element => {
  const dispatch = useDispatch()

  const [ currentLeft, setCurrentLeft ] = useState(-200)
  const notifications = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentLeft(0)

      setTimeout(() => {
        setCurrentLeft(-200)
        setTimeout(() => dispatch(removeNotification(notifications[0])), 1000)
      }, NOTIFICATION_TIMEOUT)
    }
  }, [ dispatch, notifications ])

  return (
    <div className="notificationToaster" style={{ left: currentLeft }}>
      { notifications.length > 0 && notifications[0].getMessage() }
    </div>
  )
}

export default NotificationToaster