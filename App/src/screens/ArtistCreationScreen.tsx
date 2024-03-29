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
import ImageSearcher from '@components/ImageSearcher'

import { _ } from '@utils/TranslationUtils'

const ArtistCreationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const apiManager = selectApiManager()
  const artists = selectArtists()

  const [ artistName, setArtistName ] = useState('')
  const [ imageUrl, setImageUrl ] = useState('')

  const handleInput = useCallback(value => setArtistName(value), [])
  const setArtistImage = useCallback(url => setImageUrl(url), [])

  const createArtist = useCallback(() => {
    apiManager.post('/artist', { name: artistName, imageUrl }).then(([code, data]) => {
      if (code === 201) {
        dispatch(setArtists(Arrays.add(artists, Artist.fromObject(data))))
        history.goBack()
      }
    })
  }, [ history, apiManager, artistName, imageUrl ])

  return (
    <Screen id="AddTrackScreen" title={_("artist.creation.screen.title")} >
      <InputWithIcon icon="user" >
        <TextInput placeHolder="artist.creation.name.placeholder" onInput={handleInput} />
      </InputWithIcon>
      <InputWithIcon icon="image" >
        <ImageSearcher initialQuery="" onSelect={setArtistImage} />
      </InputWithIcon>
      <div id="postActions">
        <Button icon="save" className="raised" onClick={createArtist} title={_("artist.creation.add.button")} />
      </div>
    </Screen>
  )
}

export default ArtistCreationScreen