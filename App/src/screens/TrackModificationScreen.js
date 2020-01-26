import React, { useCallback, forwardRef, useImperativeHandle, useState } from 'react'
import { useParams } from 'react-router-dom'

import { selectApiManager } from 'selectors/Manager'
import { selectArtist, selectArtists } from 'selectors/Artist'
import { selectTrack } from 'selectors/Track'

import InputRange from '../components/utils/InputRange'

const TrackModificationScreen = (props, ref) => {
  const { id } = useParams()

  const apiManager = selectApiManager()
  
  const [ track, setTrack ]  = useState(selectTrack(id))
  const [ artist, setArtist ]  = useState(selectArtist(track.getArtistId()))
  const [ artistState, setArtistState ] = useState('pristine')

  const artistsNames = selectArtists().map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)
  
  const download = useCallback(() => {
    apiManager.get(`download/${track.getVideoId()}`, () => false)
  })
  
  const requestServerDownload = useCallback(() => {})
  
  const deleteItem = useCallback(() => {})
  
  const createArtist = useCallback(() => {
    apiManager.post('artist', artist.getName())
  })

  const handleArtistNameSet = useCallback(event => {
    setTrack(track.withArtistName(event.target.value))
    setArtist(artist.withName(event.target.value))
    setArtistState('Modified')
  })
  const handleTitleSet = useCallback(event => setTrack(track.withTitle(event.target.value)))
  const handleDurationSet = useCallback(event => setTrack(track.withDuration(event.target.value)))
  const handleVideoIdSet = useCallback(event => setTrack(track.withVideoId(event.target.value)))

  const onSave = useImperativeHandle(ref, () => ({
    onSave: () => {
      apiManager.put(`track/${track.id}`, track)
      if (artistState != 'pristine') {
        apiManager.put(`artist/${artist.id}`, artist)
      }
    }
  }))
  
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
              defaultValue={track.getArtistName()}
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
            <i className="fa fa-fingerprint fa-2x icon" />
            <input type="text" disabled defaultValue={track.getId()} />
          </div>
          <div className="input">
            <i className="fa fa-clock fa-2x icon" />
            <input type="text" disabled defaultValue={track.getCreationDate()} />
          </div>
          <div className="input">
            <i className="fa fa-file-contract fa-2x icon" />
            <input
              type="text" disabled className={track.getStatus()}
              defaultValue={track.getStatus()}
            />
          </div>
          <div className="input">
            <i className="fab fa-youtube fa-2x icon" />
            <input
              type="text" className="form-data" id="videoId"
              defaultValue={track.getVideoId()} onInput={handleVideoIdSet}
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
  
export default forwardRef(TrackModificationScreen)