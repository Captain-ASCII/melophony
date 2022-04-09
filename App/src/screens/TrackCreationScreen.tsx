import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import Track from '@models/Track'

import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { setTracks } from '@actions/Track'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'

import { SelectStyles } from '@utils/SelectStyles'
import { Arrays } from '@utils/Immutable'


const TrackCreationScreen = (): JSX.Element => {
  const history = useHistory()
  const dispatch = useDispatch()

  const apiManager = selectApiManager()
  const tracks = selectTracks()
  const artistsNames = selectArtists().map(artist => ({'value': artist.getId(), 'label': artist.getName()}))

  const [ videoId, setVideoId ] = useState('')
  const [ title, setTitle ] = useState('')
  const [ artistName, setArtistName ] = useState('')
  const [ artists, setArtists ] = useState([])

  const handleInput = useCallback(event => {
    const value = event.target.value
    const searchForParam = value.match(/v=(.*)?(&|$)/)
    if (searchForParam) {
      console.warn(searchForParam[1])
      setVideoId(searchForParam[1])
    } else {
      setVideoId(value)
    }
  }, [setVideoId])
  const handleTitleSet = useCallback(event => setTitle(event.target.value), [setTitle])
  const handleArtistNameSet = useCallback(event => setArtistName(event.target.value), [setArtistName])
  const handleArtistsSet = useCallback(selection => {
    setArtists(selection.map((a: any) => a.value))
  }, [setArtists])

  const requestServerDownload = useCallback(() => {
    apiManager.post('/track', { videoId, title, artists, artistName }).then(([code, data]) => {
      if (code === 201) {
        dispatch(setTracks(Arrays.add(tracks, Track.fromObject(data))))
      }
    })
    history.goBack()
  }, [ history, apiManager, videoId, title, artistName, artists ])

  return (
    <div id="AddTrackScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Add a new track</h2>
        <CloseButton />
      </div>
      <div className="input">
        <i className="fab fa-youtube fa-2x icon" />
        <input
          type="text" className="form-data" onChange={handleInput} value={videoId}
          id="videoId" placeholder="Youtube video ID / Full Youtube URL"
        />
      </div>
      <div className="input">
        <i className="fa fa-music fa-2x icon" />
        <input type="text" className="form-data" id="title" placeholder="Title" onInput={handleTitleSet} />
      </div>
      <div className="input">
        <i className="fa fa-male fa-2x icon" />
        <Select
          isMulti isClearable className="multiSelect" id="artistNames" placeholder="Artists..." styles={SelectStyles}
          options={artistsNames} onChange={handleArtistsSet}
        />
        <i className="fa fa-plus fa-2x icon" />
        <input type="text" className="form-data" id="title" placeholder="New artist" onInput={handleArtistNameSet} />
      </div>
      <div id="postActions">
        <Button icon="download" className="raised" onClick={requestServerDownload} title="Download" />
      </div>
    </div>
  )
}

export default TrackCreationScreen