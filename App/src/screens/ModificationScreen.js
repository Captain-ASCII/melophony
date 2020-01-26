import React, { useCallback, useRef } from 'react'
import { Route, useRouteMatch, useHistory } from 'react-router-dom'

import ArtistModificationScreen from 'screens/ArtistModificationScreen'
import TrackModificationScreen from 'screens/TrackModificationScreen'

import CloseButton from '../components/utils/CloseButton'

const ModificationScreen = () => {
  const screenRef = useRef()

  const history = useHistory()
  const { url } = useRouteMatch()
  const save = useCallback(() => { 
    if (screenRef.current.onSave()) {
      history.goBack()
    }
  })

  return (
    <div id="modificationPage">
      <div id="modificationPageHeader">
        <CloseButton />
        <Route path={`${url}/artist/:id`} >
          <ArtistModificationScreen ref={screenRef} />
        </Route>
        <Route path={`${url}/track/:id`} >
          <TrackModificationScreen ref={screenRef} />
        </Route>
        <div id="saveButton" className="button raised" onClick={save} >Save</div>
      </div>
    </div>
  )
}

export default ModificationScreen