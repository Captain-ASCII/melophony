import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { selectArtist, selectArtists } from 'selectors/Artist'
import { selectTrack } from 'selectors/Track'

import InputRange from '../components/utils/InputRange'

const TrackModificationScreen = () => {
  const { id } = useParams()
  
  const track = selectTrack(id)
  const artist = selectArtist(track.getArtistId())
  const artistsNames = selectArtists().map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)
  
  const [ artistName, setArtistName ] = useState(artist.getName())
  // this.artistsNames = dataStorage.getAsArray("artists").map(artist => <option key={ artist.id } data-value={ artist.id } value={ artist.name } />);
  
  const download = useCallback(() => {
    apiManager.get(`download/${track.getVideoId()}`, _ => false)
  })
  
  const requestServerDownload = useCallback(() => {})
  
  const deleteItem = useCallback(() => {})
  
  const createArtist = useCallback(() => {
    apiManager.post('artist', this.state.artistName)
  })

  const handleInput = useCallback(event => setArtistName(event.target.value))
  
  return (
    <div>
      <div className="columns">
        <div>
          <div className="input">
            <i className="fa fa-music fa-2x icon" />
            <input
              type="text" className="form-data" id="title"
              defaultValue={track.getTitle()}
            />
          </div>
          <div className="input">
            <i className="fa fa-male fa-2x icon" />
            <input
              type="text" list="artistNames" className="form-data"
              id="artist" autoComplete="off" onInput={handleInput}
              defaultValue={artistName}
            />
            <i className="fa fa-plus fa-1x icon button" onClick={createArtist} />
            <datalist id="artistNames">{ artistsNames }</datalist>
          </div>
          <div className="input">
            <i className="fa fa-ruler fa-2x icon" />
            <input
              type="text" className="form-data" id="duration"
              defaultValue={track.getDuration()}
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
              defaultValue={track.getVideoId()}
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
  
export default TrackModificationScreen