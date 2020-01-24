import React, { forwardRef, useCallback, useState, useImperativeHandle } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { setArtist } from 'actions/Artist'
import { notifyListener } from 'actions/Listener'

import { selectArtists, selectArtist } from 'selectors/Artist'
import { selectTracks } from 'selectors/Track'

const ArtistModificationScreen = (props, ref) => {
  const dispatch = useDispatch()

  const { id } = useParams()
  const artists = selectArtists()
  const [ artist, setArtistState ] = useState(selectArtist(id))
  const initialName = artist.name
  
  const artistsNames = artists.map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)

  const setName = useCallback(event => setArtistState(artist.withName(event.target.value)))

  useImperativeHandle(ref, () => ({
    onSave() {
      dispatch(notifyListener('', { message: 'Hello' }))
      // const sameNameArtist = artists.find(artist => artist.name === artist.getName())
      // if (sameNameArtist && (sameNameArtist.id != artist.id)) {
      //   dispatch(setOverlay(`Cela va effacer l'artiste "${initialName}" et affecter toutes ses musiques à l'artiste "${artist.name}", êtes vous sûr ?`))
      //   dispatch(addListener('overlay', () => {
      //     let tracks = selectTracks().filter(track => track.artist == artist.id)
      //     tracks.forEach(track => {
      //       track.artist = sameNameArtist.id
      //       apiManager.put(`track/${track.id}`, track)
      //     })
      //     apiManager.delete(`artist/${artist.id}`)
      //   }))
      // } else if (!sameNameArtist) {
      //   dispatch(setArtist(artist))
      //   apiManager.put(`artist/${id}`, artist)
      // }
    }
  }))
    
  return (
    <div>
      <div className="input">
        <i className="fa fa-male fa-2x icon" />
        <input
          type="text" list="artistNames" className="form-data"
          id="name" keepvalue="true" autoComplete="off"
          defaultValue={artist.getName()} onInput={setName}
        />
        <datalist id="artistNames">{artistsNames}</datalist>
      </div>
      <div className="input">
        <i className="fa fa-fingerprint fa-2x icon" />
        <input type="text" disabled defaultValue={artist.getId()} />
      </div>
    </div>
  )
}
    
export default forwardRef(ArtistModificationScreen)