import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import Artist from '@models/Artist'
import Track from '@models/Track'

import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { setTracks } from '@actions/Track'
import { setArtists as setArtistsInState } from '@actions/Artist'

import Button from '@components/Button'
import Screen from '@components/Screen'
import TextInput from '@components/TextInput'
import InputWithIcon from '@components/InputWithIcon'
import Icon from '@components/Icon'

import { SelectStyles } from '@utils/SelectStyles'
import { Arrays } from '@utils/Immutable'
import { ApiClient } from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

const YOUTUBE_URL = "https://www.youtube.com"


const TrackCreationScreen = (): JSX.Element => {
  const history = useHistory()
  const dispatch = useDispatch()

  const apiManager = selectApiManager()
  const tracks = selectTracks()
  const allArtists = selectArtists()
  const artistsNames = allArtists.map(artist => ({'value': artist.getId(), 'label': artist.getName()}))

  const [ fileId, setFileId ] = useState('')
  const [ title, setTitle ] = useState('')
  const [ artistName, setArtistName ] = useState('')
  const [ artists, setArtists ] = useState([])

  const lookForInfo = async function(fileId: string) {
    const apiClient = new ApiClient(YOUTUBE_URL)
    const [code, result] = await apiClient.get('/oembed', {'format': 'json', 'url': encodeURIComponent(YOUTUBE_URL + "/watch?v=" + fileId)})
    if (code === 200) {
      const fullTitle = result['title'].replace(/ \(Official Video\)/i, '')
      const parts = fullTitle.split(/ [-/]+ /)
      const foundArtistName = parts.length > 1 ? parts[0] : ''
      const title = parts.length > 1 ? parts[1] : fullTitle
      const artistKnown = allArtists.find((a: Artist) => a.getName() === foundArtistName)
      setArtistName(foundArtistName)
      if (artistKnown) {
        setArtists([artistKnown.getId()])
      }
      setTitle(title)
    }
  }

  const handleInput = useCallback(value => {
    const searchForParam = value.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
    if (searchForParam && searchForParam[7] && searchForParam[7].length == 11) {
      setFileId(searchForParam[7])
      lookForInfo(searchForParam[7])
    } else {
      setFileId(value)
      if (value.length === 11) {
        lookForInfo(value)
      }
    }
  }, [setFileId])
  const handleTitleSet = useCallback(value => setTitle(value), [setTitle])
  const handleArtistNameSet = useCallback(value => setArtistName(value), [setArtistName])
  const handleArtistsSet = useCallback(selection => {
    setArtists(selection.map((a: any) => a.value))
    setArtistName(selection.length > 0 ? selection[0].label : "")
  }, [setArtists])

  const requestServerDownload = useCallback(() => {
    apiManager.post('/track', { fileId, title, artists, artistName }).then(([code, data]) => {
      if (code === 201) {
        const newTrack = Track.fromObject(data)
        dispatch(setTracks(Arrays.add(tracks, newTrack)))
        if (allArtists.every((a: Artist) => a.getId() !== newTrack.getArtist().getId())) {
          dispatch(setArtistsInState(Arrays.concat(allArtists, data.artists.map((a: any) => Artist.fromObject(a)))))
        }
      }
    })
    history.goBack()
  }, [ history, apiManager, fileId, title, artistName, artists ])

  return (
    <Screen id="AddTrackScreen" title={ _("track.creation.screen.title") } >
      <InputWithIcon icon="youtube" collection="fab">
        <TextInput placeHolder="track.creation.youtube.video.id.placeholder" value={fileId} onInput={handleInput} />
      </InputWithIcon>
      <InputWithIcon icon="music">
        <TextInput placeHolder="track.creation.track.title.placeholder" value={title} onInput={handleTitleSet} />
      </InputWithIcon>
      <InputWithIcon icon="male">
        <Select
          isMulti isClearable className="multiSelect" id="artistNames" placeholder={_("track.creation.artist.list.placeholder")} styles={SelectStyles}
          options={artistsNames} onChange={handleArtistsSet} value={artistsNames.filter(option => option.label === artistName)}
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