
import { ADD_LISTENER, REMOVE_LISTENER, NOTIFY_EVENT, EventAction } from '@actions/Event'

import { Arrays } from '@utils/Immutable'

import EventListener from '@models/EventListener'

const listeners = <T extends unknown>(state: Array<EventListener<T>> = [], action: EventAction<T>): Array<EventListener<T>> => {
  switch (action.type) {
    case ADD_LISTENER:
      return Arrays.add(state, action.listener)
    case REMOVE_LISTENER:
      return Arrays.remove(state, (element: EventListener<T>): boolean => action.listener.getId() === element.getId())
    case NOTIFY_EVENT:
      for (const listener of state) {
        if (action.event.getId() === listener.getId()) {
          listener.getCallback()(action.event)
        }
      }
      return state

    default:
      return state
  }
}

export default listeners
