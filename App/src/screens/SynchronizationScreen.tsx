import React, { useState, useCallback, useEffect } from 'react'

import { getServerData } from '@index'

import { selectApiManager } from '@selectors/App'

import { _ } from '@utils/TranslationUtils'

import CheckMark from '@components/CheckMark'
import LoginForm from '@components/LoginForm'
import Loader from '@components/Loader'


class SynchroItem {
  private name: string
  private synchronized: boolean
  private successfullySynchronized: boolean

  constructor(name: string, synchronized: boolean, successfullySynchronized: boolean) {
    this.name = name
    this.synchronized = synchronized
    this.successfullySynchronized = successfullySynchronized
  }

  getName(): string {
    return this.name
  }

  isSynchronized(): boolean {
    return this.synchronized
  }

  isSuccessfullySynchronized(): boolean {
    return this.successfullySynchronized
  }
}

const SynchronizationScreen = (): JSX.Element => {
  const apiManager = selectApiManager()

  const [synchronizationList, setSynchronizationList] = useState([])
  const [socket, setSocket] = useState(null)
  const [content, setContent] = useState(<Loader />)

  const trySynchronization = useCallback(() => {
    apiManager.get('/synchronization/capabilities').then(([code, data, headers]: [number, any, Headers]) => {
      if (code === 200) {
        let touched = false
        document.getElementById("synchronizationScreen").addEventListener("touchstart", () => touched = true);

        apiManager.get('/synchronization').then(response => {
          const socket = new WebSocket('ws://localhost:1805')
          socket.addEventListener('message', function (event: MessageEvent) {
            setContent(null)
            const message = JSON.parse(event.data)
            const state = message.synchronizationState
            if (message.synchronizationCompleted) {
              const [success, failures] = state.reduce(([success, failures]: [number, number], item: any) => {
                if (item.isSuccessfullySynchronized) {
                  success++
                } else {
                  failures++
                }
                return [success, failures]
              }, [0, 0])
              setSynchronizationList([
                new SynchroItem(`Success synchronization(s): ${success}/${state.length}`, true, true),
                new SynchroItem(`Failure synchronization(s): ${failures}/${state.length}`, true, false)
              ])
              getServerData(apiManager)
            } else {
              setSynchronizationList(state.map((item: any) => new SynchroItem(item.name, item.isSynchronized, item.isSuccessfullySynchronized)))
              if (message.modifiedItem && !touched) {
                document.getElementById(message.modifiedItem.name).scrollIntoView(false)
              }
            }
          })
          setSocket(socket)
        })
      } else {
        setContent(
          <div className="login" >
            <p className="statusMessage warning">{_('synchronization.login.again')}</p>
            <LoginForm loginOnly onLoginResponse={trySynchronization} />
          </div>
        )
      }
    })
  }, [])

  useEffect(() => trySynchronization(), [])

  return (
    <div id="synchronizationScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">{_('synchronization.title')}</h2>
      </div>
      <p className="paragraph centered" >{_("synchronization.explanation")}</p>
      { content }
      {
        synchronizationList.length > 0 && synchronizationList.map((item, index) => {
          return (
            <div key={`${item.getName()}_${index}`} id={`${item.getName()}`} className="synchroItem" >
              <h5>{item.getName()}</h5>
              <CheckMark isChecked={item.isSynchronized()} result={item.isSuccessfullySynchronized()} />
            </div>
          )
        })
      }
    </div>
  )
}

  export default SynchronizationScreen