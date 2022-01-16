
import React, { useCallback, createContext, useContext, useState } from 'react'

import { Arrays } from '@utils/Immutable'


const CheckableItem = <T extends unknown>({ index, item, onStateChange, checked, renderItem }:
  { index: number, onStateChange: (item: T, i: number) => void; item: T; checked: boolean; renderItem: (item: T) => JSX.Element }): JSX.Element => {

  return (
    <div key={index} onClick={() => onStateChange(item, index)} className={`checkItem ${checked ? 'checked' : 'unchecked'}`}>
      { renderItem(item) }
    </div>
  )
}

const CheckableItemList = <T extends unknown>(props: { items: Array<T>; initialItems: Array<T>; checkMethod: (l: T, r: T) => boolean; onSelect: (items: Array<T>) => void, renderItem: (item: T) => JSX.Element }): JSX.Element => {

  const [checkedItems, setChecked] = useState(props.initialItems)

  const check = useCallback((item: T, index: number) => {
    const initialLength = checkedItems.length
    const newItems = Arrays.remove(checkedItems, o => props.checkMethod(o, item))

    if (initialLength === newItems.length) {
        newItems.push(item)
    }

    setChecked(newItems)
    props.onSelect(newItems)
  }, [ checkedItems, setChecked ])

  return (
    <div className="checkableList" >
      {
        props.items.map((item: T, index: number) => {
          return <CheckableItem key={index} index={index} checked={checkedItems.some(o => props.checkMethod(o, item))}
                onStateChange={check} item={item} renderItem={props.renderItem} />
        })
      }
    </div>
  )
}

CheckableItemList.defaultProps = {
  checkMethod: (l: any, r: any) => l === r
}

export default CheckableItemList