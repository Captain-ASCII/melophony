import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'
import { QueryParameters } from '@utils/ApiManager'

import Artist from '@models/Artist'
import Event from '@models/Event'
import OverlayMessage from '@models/OverlayMessage'

import { setArtist, setArtists } from '@actions/Artist'
import { notifyEvent } from '@actions/Event'

import { selectArtists, selectArtist } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { selectApiManager } from '@selectors/App'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'
import StatusMessage, { MessageType } from '@components/StatusMessage'
import ImageSearcher from '@components/ImageSearcher'

const ArtistModificationScreen = (): JSX.Element => {
  const history = useHistory()
  const { id } = useParams<QueryParameters>()

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
        const sameNameArtist = artists.find(current => current.getName() === artist.getName() && current.getId() !== artist.getId());
        if (sameNameArtist) {
          dispatch(notifyEvent(
            new Event('OVERLAY_ID',
              new OverlayMessage(
                `Cela va effacer l'artiste "${initialName}" et affecter toutes ses musiques à l'artiste "${artist.getName()}", êtes vous sûr ?`,
                () => {
                  tracks.forEach(track => {
                    apiManager.put(`/track/${track.getId()}`, {artists: [sameNameArtist.getId()]})
                  })
                  apiManager.delete(`/artist/${artist.getId()}`)
                  history.goBack()
                }
              )
            )
          ))
        } else {
          apiManager.put(`/artist/${id}`, artist).then(([code, data]) => {
            dispatch(setArtist(Artist.fromObject(data)))
          })
          history.goBack()
        }
      }, [ apiManager, history, artist, artists, tracks, dispatch, id, initialName ])

      const deleteArtist = useCallback(() => {
        apiManager.delete(`/artist/${id}`).then(([code, data]) => {
          if (code === 200) {
            dispatch(setArtists(Arrays.remove(artists, a => a.getId().toString() === id)))
          }
        })
        history.goBack()
      }, [ history, apiManager ])

      const setName = useCallback(event => setArtistState(artist.withName(event.target.value)), [ artist ])
      const setArtistImage = useCallback(url => setArtistState(artist.withImageUrl(url)), [artist])

      return (
        <div className="screen" >
          <div id="pageHeader">
            <h2 id="pageTitle">Modify an artist</h2>
            <CloseButton />
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
          <div className="input">
            <i className="fa fa-image fa-2x icon" />
            <ImageSearcher initialQuery={artist.getName()} onSelect={setArtistImage} />
          </div>
          <div id="postActions" >
            <Button icon="save" className="raised" onClick={save} title="Save" />
            <Button icon="trash" className="raised alert" onClick={deleteArtist} title="Delete" />
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