import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'
import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { setArtists } from '@actions/Artist'
import Artist from '@models/Artist'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'

const ArtistCreationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const apiManager = selectApiManager()
  const artists = selectArtists()

  const [ artistName, setArtistName ] = useState('')

  const handleInput = useCallback(event => setArtistName(event.target.value), [])

  const createArtist = useCallback(() => {
    apiManager.post('/artist', { name: artistName }).then(([code, data]) => {
      if (code === 201) {
        dispatch(setArtists(Arrays.add(artists, Artist.fromObject(data))))
      }
    })
    history.goBack()
  }, [ history, apiManager, artistName ])

  return (
    <div id="AddTrackScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Add a new artist</h2>
        <CloseButton />
      </div>
      <div className="input">
        <i className="fa fa-solid fa-user fa-2x icon" />
        <input
          type="text" className="form-data" onInput={handleInput}
          id="artistName" defaultValue="" placeholder="Artist name"
        />
      </div>
      <div id="postActions">
        <Button icon="plus" className="raised" onClick={createArtist} title="Add" />
      </div>
    </div>
  )
}

export default ArtistCreationScreen