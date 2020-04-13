import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import Event from '@models/Event'
import OverlayMessage from '@models/OverlayMessage'

import { setArtist } from '@actions/Artist'
import { notifyEvent } from '@actions/Event'

import { selectArtists, selectArtist } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { selectApiManager } from '@selectors/App'

const ArtistModificationScreen = ({ onSaveCallback }: { onSaveCallback: (f: () => boolean) => void }): JSX.Element => {
  const { id } = useParams()

  if (id) {
    const [ artist, setArtistState ] = useState(selectArtist(id))
    if (artist) {
      const dispatch = useDispatch()

      const apiManager = selectApiManager()
      const initialName = artist.getName()

      const artists = selectArtists()
      const artistsNames = artists.map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)

      useEffect(() => {
        onSaveCallback((): boolean => {
          const sameNameArtist = artists.find(current => current.getName() === artist.getName())
          if (sameNameArtist) {
            if (sameNameArtist.getId() != artist.getId()) {
              dispatch(notifyEvent(
                new Event('OVERLAY',
                  new OverlayMessage(
                    `Cela va effacer l'artiste "${initialName}" et affecter toutes ses musiques à l'artiste "${artist.getName()}", êtes vous sûr ?`,
                    () => {
                      const tracks = selectTracks().filter(track => track.getArtist().getId() == artist.getId())
                      tracks.forEach(track => {
                        apiManager.put(`/track/${track.getId()}`, track.withArtist(sameNameArtist), () => null)
                      })
                      apiManager.delete(`/artist/${artist.getId()}`, () => null)
                    }
                  )
                )
              ))
            }
            return false
          } else {
            dispatch(setArtist(artist))
            apiManager.put(`/artist/${id}`, artist, () => null)
            return true
          }
        })
      }, [ apiManager, artist, artists, dispatch, id, initialName, onSaveCallback ])

      const setName = useCallback(event => setArtistState(artist.withName(event.target.value)), [ artist ])

      return (
        <div>
          <div className="input">
            <i className="fa fa-male fa-2x icon" />
            <input
              type="text" list="artistNames" className="form-data"
              id="name" autoComplete="off" defaultValue={artist.getName()} onInput={setName}
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
  }

  return (
    <div>Artist not found</div>
  )
}

export default ArtistModificationScreen