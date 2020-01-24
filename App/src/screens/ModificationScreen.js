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
    // let data = {}
    // const inputs = document.querySelectorAll('.form-data')

    // for (const input of inputs) {
    //   if (input.list) {
    //     let listElement = document.querySelector(`#${input.list.id} option[value="${input.value}"]`)
    //     if (input.getAttribute('keepValue')) {
    //       data[input.id] = input.value
    //     } else if (listElement) {
    //       data[input.id] = listElement.getAttribute('data-value')
    //     }
    //   } else {
    //     data[input.id] = input.value
    //   }
    // }

    screenRef.current.onSave()
    
    history.goBack()
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