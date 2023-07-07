import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import Artist from '@models/Artist'
import Track from '@models/Track'
import Icon from '@components/Icon'

import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { selectFiles } from '@selectors/File'
import { selectTracks } from '@selectors/Track'
import { setTracks } from '@actions/Track'
import { setArtists as setArtistsInState } from '@actions/Artist'

import Button from '@components/Button'
import InputWithIcon from '@components/InputWithIcon'
import ProviderList, { TrackProviderParameters } from '@providers/ProviderList'
import Screen from '@components/Screen'
import TextInput from '@components/TextInput'

import { Arrays, Objects } from '@utils/Immutable'
import { SelectStyles } from '@utils/SelectStyles'
import { _ } from '@utils/TranslationUtils'
import Log from '@utils/Log'


export interface TrackCreationParameters extends TrackProviderParameters {
  setProviderKey: (key: string) => void;
}


const TrackCreationScreen = (): JSX.Element => {
  const history = useHistory()
  const dispatch = useDispatch()

  const tracks = selectTracks()
  const allArtists = selectArtists()
  const allFiles = selectFiles()
  const apiManager = selectApiManager()

  const artistsNames = allArtists.map(artist => ({'value': artist.getId(), 'label': artist.getName()}))

  const [ extraInfo, setExtraInfo ] = useState({})
  const [ providerKey, setProviderKey ] = useState('')
  const [ title, setTitle ] = useState('')
  const [ artistName, setInternalArtistName ] = useState('')
  const [ artists, setArtists ] = useState([])
  const [ requestData, setData ] = useState(null)

  const setArtistName = (value: string) => {
    setInternalArtistName(value)
    const knownArtist = allArtists.find((a: Artist) => a.getName() === value)
    if (knownArtist) {
      setArtists([knownArtist.getId()])
    }
  }

  const handleTitleSet = useCallback(value => setTitle(value), [setTitle])
  const handleArtistNameSet = useCallback(value => setArtistName(value), [setArtistName])
  const handleArtistsSet = useCallback(selection => {
    const newArtists = selection.map((a: any) => a.value)
    const newArtistName = selection.length > 0 ? selection[0].label : ""
    setArtists(newArtists)
    setInternalArtistName(newArtistName)
  }, [setArtists])

  const requestServerDownload = useCallback(() => {
    const trackRequest = {providerKey, title, artistName, artists, ...extraInfo}

    if (!Objects.containsKeys(trackRequest, ['title', 'artistName', 'providerKey'])) {
      Log.w("Missing keys in track adding request, refusing...")
    }

    apiManager.postFile('/track', trackRequest, requestData).then(([code, data]) => {
      if (code === 201) {
        const newTrack = Track.fromObject(data, Arrays.toMap(allArtists, (artist) => artist.getId()), Arrays.toMap(allFiles, (file) => file.getId()))
        dispatch(setTracks(Arrays.add(tracks, newTrack)))
        if (allArtists.every((a: Artist) => a.getId() !== newTrack.getArtist().getId())) {
          dispatch(setArtistsInState(Arrays.concat(allArtists, data.artists.map((a: any) => Artist.fromObject(a)))))
        }
        history.goBack()
      }
    })
  }, [ history, apiManager, providerKey, title, artistName, artists, extraInfo ])

  return (
    <Screen id="AddTrackScreen" title={ _("track.creation.screen.title") } >
        <ProviderList setProviderKey={setProviderKey} setExtraInfo={setExtraInfo} setData={setData} setTitle={setTitle} setArtistName={setArtistName} />
        <InputWithIcon icon="music">
          <TextInput placeHolder="track.creation.track.title.placeholder" value={title} onInput={handleTitleSet} />
        </InputWithIcon>
        <InputWithIcon icon="male">
          <Select
            isMulti isClearable className="multiSelect" id="artistNames" placeholder={_("track.creation.artist.list.placeholder")} styles={SelectStyles}
            options={artistsNames} onChange={handleArtistsSet} value={artistsNames.filter(option => option.label !== "" && option.label === artistName)}
          />
          <Icon icon="plus" size="2x" />
          <TextInput placeHolder="track.creation.artist.creation.placeholder" value={artistName} onInput={handleArtistNameSet} />
        </InputWithIcon>
      <div id="postActions">
        <Button icon="download" className="raised" onClick={requestServerDownload} title={_("track.creation.download")} />
      </div>
    </Screen>
  )
}

export default TrackCreationScreen