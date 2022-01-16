import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import Select, { StylesConfig } from 'react-select'

import Artist from '@models/Artist'
import Track from '@models/Track'

import { selectApiManager } from '@selectors/App'
import { selectArtist, selectArtists } from '@selectors/Artist'
import { selectTrack } from '@selectors/Track'

import { setTrack } from '@actions/Track'

import InputRange from '@components/InputRange'
import StatusMessage, { MessageType } from '@components/StatusMessage'
import CloseButton from '@components/CloseButton'
import IconButton from '@components/IconButton'
import { Objects } from '@utils/Immutable'

const colourStyles: StylesConfig = {
  container: (styles: any) => ({ ...styles, flex: 1 }),
  valueContainer: (styles: any) => ({...styles, height: 30 }),
  control: (styles: any) => ({ ...styles, backgroundColor: '#22252c', borderWidth: 0, minHeight: 36, height: 36, flex: 1 }),
  option: (styles: any) => ({...styles, backgroundColor: '#22252c' }),
  placeholder: (styles: any) => ({...styles, fontSize: 13 }),
  input: (styles: any) => ({...styles, color: 'white', fontSize: 13}),
  multiValue: (styles: any) => ({ ...styles, backgroundColor: '#2c84F8' }),
  multiValueLabel: (styles: any) => ({...styles, color: 'white', fontSize: 13, fontFamily: 'Arial'}),
  menuList: (styles: any) => ({...styles, color: 'white', fontSize: 13, fontFamily: 'Arial'}),
  multiValueRemove: (styles: any) => ({...styles, ':hover': {color: '#dc2d1b'}}),
  menu: (styles: any) => ({...styles, backgroundColor: '#22252c'})
}

function getInt(v: string): number {
  const n = parseInt(v)
  if (isNaN(n)) {
    return 0
  }
  return n
}

function getValidTime(time: number, track: Track): number {
  return Math.max(0, Math.min(time, track.getDuration()))
}

const TrackModificationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { id } = useParams()

  if (id) {
    const [ track, setCurrentTrack ]  = useState(selectTrack(parseInt(id)))

    if (track) {
      const apiManager = selectApiManager()

      const [ modifications, setModifications ] = useState({})
      const [ artist, setArtist ]  = useState(selectArtist(track.getArtist().getId()))

      const save = useCallback(() => {
        if (!Objects.isEmpty(modifications)) {
          apiManager.put(`/track/${track.getId()}`, modifications)
          dispatch(setTrack(track))
        }
        history.goBack()
      }, [ dispatch, apiManager, history, artist, track ])

      const artistsNames = selectArtists().map(artist => ({'value': artist.getId(), 'label': artist.getName()}))

      const requestServerDownload = useCallback(() => apiManager.post(`/file/${track.getFile().getVideoId()}`, { forceDownload: true }), [ apiManager, track ])

      const deleteItem = useCallback(() => apiManager.delete(`/track/${track.getId()}`), [ apiManager, track ])

      const createArtist = useCallback(() => {
        apiManager.post('/artist', artist)
      }, [ apiManager, artist ])

      const handleTitleSet = useCallback(event => {
        setModifications(Object.assign(modifications, {'title': event.target.value}))
        setCurrentTrack(track.withTitle(event.target.value))
      }, [ track ])

      const handleArtistNameSet = useCallback(artists => {
        setModifications(Object.assign(modifications, {'artists': artists.map((a: any) => a.value)}))
        setCurrentTrack(track.withArtists(artists.map((a: any) => new Artist(a.value, a.label))))
      }, [ artist, track ])

      const handleStartSet = useCallback(value => {
        const time = getValidTime(value, track)
        setModifications(Object.assign(modifications, {'startTime': time}))
        setCurrentTrack(track.withStartTime(time))
      }, [ track ])

      const handleEndSet = useCallback(value => {
        const time = getValidTime(value, track)
        setModifications(Object.assign(modifications, {'endTime': time}))
        setCurrentTrack(track.withEndTime(time))
      }, [ track ])

      const handleStartSetFromEvent = useCallback(event => handleStartSet(getInt(event.target.value)), [ handleStartSet ])
      const handleEndSetFromEvent = useCallback(event => handleEndSet(getInt(event.target.value)), [ handleEndSet ])

      return (
        <div className="screen" >
          <div id="pageHeader">
            <h2 id="pageTitle">Track modification</h2>
            <CloseButton />
          </div>
          <div className="columns">
            <div>
              <div className="input">
                <i className="fa fa-music fa-2x icon" />
                <input
                  type="text" className="form-data" id="title"
                  defaultValue={track.getTitle()} onInput={handleTitleSet}
                />
              </div>
              <div className="input">
                <i className="fa fa-male fa-2x icon" />
                <Select
                  isMulti isClearable id="artistNames" styles={colourStyles}
                  options={artistsNames} onChange={handleArtistNameSet}
                  defaultValue={track.getArtists().map(a => ({value: a.getId(), label: a.getName()}))}
                />
                <IconButton icon="plus" onClick={createArtist} />
              </div>
              <div className="input">
                <i className="fa fa-ruler fa-2x icon" />
                <input
                  type="text" className="form-data" id="duration"
                  disabled defaultValue={track.getDuration()}
                />
              </div>
              <div className="input">
                <i className="fa fa-step-backward fa-2x icon" />
                <input type="text" value={track.getStartTime()} onChange={handleStartSetFromEvent} />
              </div>
              <div className="input">
                <i className="fa fa-step-forward fa-2x icon" />
                <input type="text" value={track.getEndTime()} onChange={handleEndSetFromEvent} />
              </div>

              <div className="input">
                <i className="fa fa-fingerprint fa-2x icon" />
                <input type="text" disabled defaultValue={track.getId()} />
              </div>
              <div className="input">
                <i className="fa fa-clock fa-2x icon" />
                <input type="text" disabled defaultValue={track.getCreationDate().toISOString()} />
              </div>
              <div className="input">
                <i className="fa fa-file-contract fa-2x icon" />
                <input
                  type="text" disabled className={track.getFile().getState()}
                  defaultValue={track.getFile().getState()}
                />
              </div>
              <div className="input">
                <i className="fab fa-youtube fa-2x icon" />
                <input type="text" className="form-data" id="videoId" disabled defaultValue={track.getFile().getVideoId()} />
              </div>
            </div>
            <div id="serverInformation">
              <h2 style={{ marginLeft: 5 }} >Actions</h2>
              <div className="actions">
                <div className="button raised" onClick={requestServerDownload} >Download</div>
                <div className="button raised alert" onClick={deleteItem} >Delete</div>
              </div>
            </div>
            <div id="trackBarModifier">
              <h2>Track duration</h2>
              <div className="input">
                <i className="fa fa-ruler fa-2x icon" />
                <InputRange track={track} multiRange onStartSet={handleStartSet} onEndSet={handleEndSet} />
              </div>
            </div>
          </div>

          <div id="postActions" >
            <div id="saveButton" className="button raised" onClick={save} >Save</div>
          </div>
        </div>
      )
    }
  }
  return (
    <>
      <CloseButton />
      <StatusMessage message="No track found" type={MessageType.ERROR} />
    </>
  )
}

export default TrackModificationScreen