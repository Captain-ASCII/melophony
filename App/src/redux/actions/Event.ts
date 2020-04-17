
import Event from '@models/Event'
import EventListener from '@models/EventListener'

export const ADD_LISTENER = 'ADD_LISTENER'
export const REMOVE_LISTENER = 'REMOVE_LISTENER'
export const NOTIFY_EVENT = 'NOTIFY_EVENT'

interface AddListenerAction<T> {
  type: typeof ADD_LISTENER;
  listener: EventListener<T>;
}

interface RemoveListenerAction<T> {
  type: typeof REMOVE_LISTENER;
  listener: EventListener<T>;
}

interface NotifyEventAction<T> {
  type: typeof NOTIFY_EVENT;
  event: Event<T>;
}

export const addListener = <T extends unknown>(listener: EventListener<T>): EventAction<T> => ({ type: ADD_LISTENER, listener })
export const removeListener = <T extends unknown>(listener: EventListener<T>): EventAction<T> => ({ type: REMOVE_LISTENER, listener })
export const notifyEvent = <T extends unknown>(event: Event<T>): EventAction<T> => ({ type: NOTIFY_EVENT, event })

export type EventAction<T> = AddListenerAction<T> | RemoveListenerAction<T> |NotifyEventAction<T>