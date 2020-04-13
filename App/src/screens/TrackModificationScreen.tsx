import React, { useCallback, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { selectApiManager } from '@selectors/App'
import { selectArtist, selectArtists } from '@selectors/Artist'
import { selectTrack } from '@selectors/Track'

import InputRange from '@components/InputRange'
import StatusMessage, { MessageType } from '@components/StatusMessage'

const TrackModificationScreen = ({ onSaveCallback }: { onSaveCallback: (f: () => boolean) => void }): JSX.Element => {
  const { id } = useParams()

  if (id) {
    const [ track, setTrack ]  = useState(selectTrack(parseInt(id)))

    if (track) {
      const apiManager = selectApiManager()

      const [ artist, setArtist ]  = useState(selectArtist(track.getArtist().getId()))
      const [ artistState, setArtistState ] = useState('pristine')

      useEffect(() => {
        onSaveCallback(() => {
          apiManager.put(`/track/${track.getId()}`, track, () => false)
          if (artistState != 'pristine') {
            apiManager.put(`/artist/${artist.getId()}`, artist, () => false)
          }
          return true
        })
      }, [ apiManager, artist, artistState, onSaveCallback, track ])

      const artistsNames = selectArtists().map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)

      const download = useCallback(() => {
        apiManager.get(`/download/${track.getFile().getVideoId()}`, () => false)
      }, [ apiManager, track ])

      const requestServerDownload = useCallback(() => false, [])

      const deleteItem = useCallback(() => apiManager.delete(`/track/${track.getId()}`, () => false), [ apiManager, track ])

      const createArtist = useCallback(() => {
        apiManager.post('/artist', artist, () => false)
      }, [ apiManager, artist ])

      const handleArtistNameSet = useCallback(event => {
        const modifiedArtist = artist.withName(event.target.value)
        setArtist(modifiedArtist)
        setTrack(track.withArtist(modifiedArtist))
        setArtistState('Modified')
      }, [ artist, track ])
      const handleTitleSet = useCallback(event => setTrack(track.withTitle(event.target.value)), [ track ])
      const handleDurationSet = useCallback(event => setTrack(track.withDuration(event.target.value)), [ track ])
      const handleVideoIdSet = useCallback(event => setTrack(track.withFile(track.getFile().withVideoId(event.target.value))), [ track ])

      return (
        <div>
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
                <input
                  type="text" list="artistNames" className="form-data"
                  id="artist" autoComplete="off" onInput={handleArtistNameSet}
                  defaultValue={track.getArtist().getName()}
                />
                <i className="fa fa-plus fa-1x icon button" onClick={createArtist} />
                <datalist id="artistNames">{ artistsNames }</datalist>
              </div>
              <div className="input">
                <i className="fa fa-ruler fa-2x icon" />
                <input
                  type="text" className="form-data" id="duration"
                  defaultValue={track.getDuration()} onInput={handleDurationSet}
                />
              </div>
              <div className="input">
                <i className="fa fa-step-backward fa-2x icon" />
                <input type="text" disabled defaultValue={track.getStartTime()} />
              </div>
              <div className="input">
                <i className="fa fa-step-forward fa-2x icon" />
                <input type="text" disabled defaultValue={track.getEndTime()} />
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
                <input
                  type="text" className="form-data" id="videoId"
                  defaultValue={track.getFile().getVideoId()} onInput={handleVideoIdSet}
                />
              </div>
            </div>
            <div id="serverInformation">
              <h2 style={{ marginLeft: 5 }} >Actions</h2>
              <div className="actions">
                <div className="button raised" onClick={download} >Get locally</div>
                <div className="button raised" onClick={requestServerDownload} >Download</div>
                <div className="button raised alert" onClick={deleteItem} >Delete</div>
              </div>
            </div>
          </div>

          <div className="delimiter" />

          <h2 className="centeredTitle" >Modify track duration</h2>
          <div className="input">
            <i className="fa fa-ruler fa-2x icon" />
            <InputRange track={track} multiRange />
          </div>
        </div>
      )
    }
  }
  return (
    <StatusMessage message="No track found" type={MessageType.ERROR} />
  )
}

export default TrackModificationScreen