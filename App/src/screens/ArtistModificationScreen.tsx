import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import Event from '@models/Event'
import OverlayMessage from '@models/OverlayMessage'

import { setArtist } from '@actions/Artist'
import { notifyEvent } from '@actions/Event'

import { selectArtists, selectArtist } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { selectApiManager } from '@selectors/App'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'
import StatusMessage, { MessageType } from '@components/StatusMessage'

const ArtistModificationScreen = (): JSX.Element => {
  const history = useHistory()
  const { id } = useParams()

  if (id) {
    const [ artist, setArtistState ] = useState(selectArtist(parseInt(id)))
    if (artist) {
      const dispatch = useDispatch()
      const tracks = selectTracks().filter(track => track.getArtist().getId() == artist.getId())

      const apiManager = selectApiManager()
      const initialName = artist.getName()

      const artists = selectArtists()
      const artistsNames = artists.map(artist => <option key={artist.getId()} data-value={artist.getId()} value={artist.getName()} />)

      const save = useCallback(() => {
        const sameNameArtist = artists.find(current => current.getName() === artist.getName())
        if (sameNameArtist) {
          if (sameNameArtist.getId() != artist.getId()) {
            dispatch(notifyEvent(
              new Event('OVERLAY_ID',
                new OverlayMessage(
                  `Cela va effacer l'artiste "${initialName}" et affecter toutes ses musiques à l'artiste "${artist.getName()}", êtes vous sûr ?`,
                  () => {
                    tracks.forEach(track => {
                      apiManager.put(`/track/${track.getId()}`, track.withArtist(sameNameArtist))
                    })
                    apiManager.delete(`/artist/${artist.getId()}`)
                    history.goBack()
                  }
                )
              )
            ))
          }
          return false
        } else {
          dispatch(setArtist(artist))
          apiManager.put(`/artist/${id}`, artist)
          history.goBack()
        }
      }, [ apiManager, history, artist, artists, tracks, dispatch, id, initialName ])

      const setName = useCallback(event => setArtistState(artist.withName(event.target.value)), [ artist ])

      return (
        <div className="screen" >
          <div id="preActions" >
            <CloseButton />
          </div>
          <div id="pageHeader">
            <h2 id="pageTitle">Modify an artist</h2>
          </div>
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
          <div id="postActions" >
            <Button icon="save" className="raised" onClick={save} title="Save" />
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <CloseButton />
      <StatusMessage message="No artist found" type={MessageType.ERROR} />
    </>
  )
}

export default ArtistModificationScreen