import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'
import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { setArtists } from '@actions/Artist'
import Artist from '@models/Artist'

import Button from '@components/Button'
import Screen from '@components/Screen'
import InputWithIcon from '@components/InputWithIcon'
import TextInput from '@components/TextInput'

import { _ } from '@utils/TranslationUtils'

const ArtistCreationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const apiManager = selectApiManager()
  const artists = selectArtists()

  const [ artistName, setArtistName ] = useState('')

  const handleInput = useCallback(value => setArtistName(value), [])

  const createArtist = useCallback(() => {
    apiManager.post('/artist', { name: artistName }).then(([code, data]) => {
      if (code === 201) {
        dispatch(setArtists(Arrays.add(artists, Artist.fromObject(data))))
        history.goBack()
      }
    })
    history.goBack()
  }, [ history, apiManager, artistName ])

  return (
    <Screen id="AddTrackScreen" title={_("artist.creation.screen.title")} >
      <InputWithIcon icon="user" >
        <TextInput placeHolder="artist.creation.name.placeholder" onInput={handleInput} />
      </InputWithIcon>
      <div id="postActions">
        <Button icon="plus" className="raised" onClick={createArtist} title={_("artist.creation.add.button")} />
      </div>
    </Screen>
  )
}

export default ArtistCreationScreen