import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import Artist from '@models/Artist'
import File from '@models/File'
import Track from '@models/Track'
import Icon from '@components/Icon'

import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { selectFiles } from '@selectors/File'
import { selectTracks } from '@selectors/Track'
import { setFiles } from '@actions/File'
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

    apiManager.postFile('/track', trackRequest, requestData).then(([code, trackData]) => {
      if (code === 201) {
        apiManager.get(`/file/${trackData.file}`).then(([code, fileData]) => {
          if (code === 200) {
            const updatedFiles = Arrays.add(allFiles, File.fromObject(fileData))
            if (trackData.artists.length > 0) {
              apiManager.get(`/artist/${trackData.artists[0]}`).then(([code, artistData]) => {
                if (code === 200) {
                  let artists = allArtists
                  const newArtist = Artist.fromObject(artistData)
                  if (artists.includes(newArtist)) {
                    artists = Arrays.add(allArtists, newArtist)
                    dispatch(setArtistsInState(artists))
                  }
                  dispatch(setFiles(updatedFiles))
                  dispatch(setTracks(Arrays.add(tracks, Track.fromObject(trackData,
                    Arrays.toMap(artists, (artist) => artist.getId()),
                    Arrays.toMap(updatedFiles, (file) => file.getId())
                  ))))
                  history.goBack()
                }
              })
            }
          }
        })
      }
    })
  }, [ history, apiManager, providerKey, title, artistName, artists, extraInfo ])

  return (
    <Screen id="AddTrackScreen" title={ _("track.creation.screen.title") } >
      <ProviderList setProviderKey={setProviderKey} setExtraInfo={setExtraInfo} setData={setData} setTitle={setTitle} setArtistName={setArtistName} />
      <InputWithIcon icon="music">
        <TextInput placeHolder="track.creation.track.title.placeholder" value={title} onInput={handleTitleSet} />
      </InputWithIcon>
      <InputWithIcon icon="male"
        lines={[(inputIcon) => (
          <>
            {inputIcon}
            <Select
              isMulti isClearable className="multiSelect" id="artistNames" placeholder={_("track.creation.artist.list.placeholder")} styles={SelectStyles}
              options={artistsNames} onChange={handleArtistsSet} value={artistsNames.filter(option => option.label !== "" && option.label === artistName)}
              />
            <Icon icon="plus" size="2x" />
          </>
        ), (inputIcon) => (
          <>
            <div className="narrowOnly" >{inputIcon}</div>
            <TextInput placeHolder="track.creation.artist.creation.placeholder" value={artistName} onInput={handleArtistNameSet} />
          </>
        )]}
      />
      <div id="postActions">
        <Button icon="download" className="raised" onClick={requestServerDownload} title={_("track.creation.download")} />
      </div>
    </Screen>
  )
}

export default TrackCreationScreen