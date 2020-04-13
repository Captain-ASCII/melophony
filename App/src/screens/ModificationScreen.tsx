import React, { useCallback, useState } from 'react'
import { Route, useRouteMatch, useHistory } from 'react-router-dom'

import ArtistModificationScreen from '@screens/ArtistModificationScreen'
import TrackModificationScreen from '@screens/TrackModificationScreen'

import CloseButton from '@components/CloseButton'

class Callback<T> {

  private callback: () => T;

  constructor(callback: () => T) {
    this.callback = callback
  }

  call(): T {
    return this.callback()
  }
}

const ModificationScreen = (): JSX.Element => {

  const [ onSave, setOnSave ] = useState(new Callback(() => false))

  const history = useHistory()
  const { url } = useRouteMatch()

  const setOnSaveCallback = useCallback((callback: () => boolean) => {
    setOnSave(new Callback(callback))
  }, [])

  const save = useCallback(() => {
    if (onSave.call()) {
      history.goBack()
    }
  }, [ onSave, history ])

  return (
    <div id="modificationPage">
      <div id="modificationPageHeader">
        <CloseButton />
        <Route path={`${url}/artist/:id`} >
          <ArtistModificationScreen onSaveCallback={setOnSaveCallback} />
        </Route>
        <Route path={`${url}/track/:id`} >
          <TrackModificationScreen onSaveCallback={setOnSaveCallback} />
        </Route>
        <div id="saveButton" className="button raised" onClick={save} >Save</div>
      </div>
    </div>
  )
}

export default ModificationScreen