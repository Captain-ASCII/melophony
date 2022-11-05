import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams, Link } from 'react-router-dom'
import Select from 'react-select'

import Artist from '@models/Artist'
import Track from '@models/Track'

import { selectApiManager } from '@selectors/App'
import { selectArtist, selectArtists } from '@selectors/Artist'
import { selectTrack } from '@selectors/Track'
import { selectMediaManager } from '@selectors/App'

import { setTrack } from '@actions/Track'

import InputRange from '@components/InputRange'
import StatusMessage, { MessageType } from '@components/StatusMessage'
import CloseButton from '@components/CloseButton'
import Screen from '@components/Screen'
import Button from '@components/Button'
import TextInput from '@components/TextInput'
import { Objects } from '@utils/Immutable'
import { QueryParameters } from '@utils/ApiManager'
import { SelectStyles } from '@utils/SelectStyles'
import { _ } from '@utils/TranslationUtils'


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
  const { id } = useParams<QueryParameters>()

  if (id) {
    const [ track, setCurrentTrack ]  = useState(selectTrack(parseInt(id)))

    if (track) {
      const apiManager = selectApiManager()
      const mediaManager = selectMediaManager()

      const [ modifications, setModifications ] = useState({})
      const [ artist, setArtist ]  = useState(selectArtist(track.getArtist().getId()))
      const [ isPreparedForModification, setPreparedForModification ] = useState(false)

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

      const handleTitleSet = useCallback(value => {
        setModifications(Object.assign(modifications, {'title': value}))
        setCurrentTrack(track.withTitle(value))
      }, [ track ])

      const handleArtistNameSet = useCallback(artists => {
        setModifications(Object.assign(modifications, {'artists': artists.map((a: any) => a.value)}))
        setCurrentTrack(track.withArtists(artists.map((a: any) => Artist.fromObject(a))))
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

      const handleDurationSet = useCallback(value => {
        setModifications(Object.assign(modifications, {'duration': value}))
        setCurrentTrack(track.withDuration(value))
      }, [ track ])

      const handleStartSetFromEvent = useCallback(value => handleStartSet(getInt(value)), [ handleStartSet ])
      const handleEndSetFromEvent = useCallback(value => handleEndSet(getInt(value)), [ handleEndSet ])
      const handleDurationSetFromEvent = useCallback(value => handleDurationSet(getInt(value)), [ handleEndSet ])

      const prepareTrackForModification = useCallback(_ => {
        mediaManager.prepareTrack(track,  () => {
          setPreparedForModification(true)
        })
      }, [mediaManager, setPreparedForModification])

      return (
        <Screen title={ _("track.modification.title") }>
          <div className="columns">
            <div>
              <div className="input">
                <i className="fa fa-music fa-2x icon" />
                <TextInput placeHolder="track.modification.title.placeholder" initialValue={track.getTitle()} onInput={handleTitleSet} />
              </div>
              <div className="input">
                <i className="fa fa-male fa-2x icon" />
                <Select
                  isMulti isClearable className="multiSelect" id="artistNames" styles={SelectStyles}
                  options={artistsNames} onChange={handleArtistNameSet}
                  defaultValue={track.getArtists().map(a => ({value: a.getId(), label: a.getName()}))}
                />
                <Link to={`/artist/create`}><Button icon="plus" /></Link>
              </div>
              <div className="input">
                <i className="fa fa-step-backward fa-2x icon" />
                <TextInput placeHolder="track.modification.start.placeholder" value={track.getStartTime()} onInput={handleStartSetFromEvent} />
              </div>
              <div className="input">
                <i className="fa fa-step-forward fa-2x icon" />
                <TextInput placeHolder="track.modification.stop.placeholder" value={track.getEndTime()} onInput={handleEndSetFromEvent} />
              </div>

              <div className="input">
                <i className="fa fa-fingerprint fa-2x icon" />
                <TextInput disabled value={track.getId()} />
              </div>
              <div className="input">
                <i className="fa fa-ruler fa-2x icon" />
                <TextInput placeHolder="track.modification.length.placeholder" value={track.getDuration()} onInput={handleDurationSetFromEvent} />
                <i className="fas fa-exclamation-triangle fa-2x icon" title="Should not be changed, to reduce size of track, set track end" />
              </div>
              <div className="input">
                <i className="fa fa-clock fa-2x icon" />
                <TextInput disabled value={track.getCreationDate().toISOString()} />
              </div>
              <div className="input">
                <i className="fa fa-file-contract fa-2x icon" />
                <TextInput disabled className={track.getFile().getState()} value={track.getFile().getState()} />
              </div>
              <div className="input">
                <i className="fab fa-youtube fa-2x icon" />
                <TextInput disabled value={track.getFile().getVideoId()} />
              </div>
            </div>
            <div id="serverInformation">
              <h2>{ _("track.modification.actions") }</h2>
              <div className="actions">
                <Button className="raised" onClick={requestServerDownload} title={_("track.modification.actions.download")} />
                <Button className="raised alert" onClick={deleteItem} title={_("track.modification.actions.delete")} />
              </div>
            </div>
            <div id="trackBarModifier">
              <h2>Track duration</h2>
              <div className="input">
                <i className="fa fa-ruler fa-2x icon" />
                <Button id="trackModificationButton" className="raised" title={_("track.modification.enable.length")} onClick={prepareTrackForModification} />
                <InputRange track={track} multiRange disabled={!isPreparedForModification} onStartSet={handleStartSet} onEndSet={handleEndSet} />
              </div>
            </div>
          </div>

          <div id="postActions" >
            <Button id="saveButton" className="raised" onClick={save} title={_("track.modification.save")} />
          </div>
        </Screen>
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