
import { useEffect } from 'react'

function bindToSession(key: string, valueToKeep: string|(() => string), onFound: (value: string) => void = null) {
  useEffect(() => {
    return () => {
      const finalValue = typeof valueToKeep === 'function' ? valueToKeep() : valueToKeep
      sessionStorage.setItem(key, finalValue)
    }
  }, [valueToKeep])
  if (onFound != null) {
    useEffect(() => {
      setIfFound(key, onFound)
    }, [])
  }
}

function getFromSession(key: string, defaultValue: string = ''): string {
  return sessionStorage.getItem(key) || defaultValue
}

function setIfFound(key: string, onFound: (value: string) => void) {
  const v = getFromSession(key)
  if (v) {
    onFound(v)
  }
}


export { getFromSession, bindToSession, setIfFound }