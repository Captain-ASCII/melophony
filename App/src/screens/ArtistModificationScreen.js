import React, { useCallback } from 'react'

const ArtistModificationScreen = ({ onSave, artist }) => {
  
  // this.artistsNames = dataStorage.getAsArray('artists').map(artist => <option data-value={artist.id} value={artist.name} />)
  // this.data = dataStorage.get('artists')[this.props.match.params.id] || { id: '', name: '' }
  
  // onSave(
  //   useCallback(() => {
  //     let sameNameArtist = dataStorage.getAsArray('artists').find(artist => artist.name === this.nameInput.current.value)
  //     if (sameNameArtist && (sameNameArtist.name !== this.data.name)) {
  //       actionManager.do('ConfirmOverlay', '',
  //       `Cela va effacer l'artiste "${this.data.name}" et affecter toutes ses musiques à l'artiste "${sameNameArtist.name}", êtes vous sûr ?`,
  //       _ => {
  //         let tracks = dataStorage.getAsArray('tracks').filter(track => track.artist == this.props.match.params.id)
  //         tracks.forEach(track => {
  //           track.artist = sameNameArtist.id
  //           apiManager.put(`track/${track.id}`, track)
  //         })
  //         apiManager.delete(`artist/${this.data.id}`)
  //       }
  //       )
  //     } else if (!sameNameArtist) {
  //       super.save()
  //     }
  //   })
  // )
    
  return (
    <div>
      <div className="input">
        <i className="fa fa-male fa-2x icon" />
        <input
          type="text" list="artistNames" className="form-data"
          id="name" keepvalue="true" autoComplete="off"
          defaultValue={artist.getName()}
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
    
export default ArtistModificationScreen