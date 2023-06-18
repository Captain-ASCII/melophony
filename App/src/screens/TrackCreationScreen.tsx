import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import Artist from '@models/Artist'
import Track from '@models/Track'

import { selectApiManager } from '@selectors/App'
import { selectArtists } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { setTracks } from '@actions/Track'
import { setArtists as setArtistsInState } from '@actions/Artist'

import Button from '@components/Button'
import Screen from '@components/Screen'
import ProviderList from '@providers/ProviderList'

import { Arrays, Objects } from '@utils/Immutable'
import { _ } from '@utils/TranslationUtils'
import Log from '@utils/Log'


export interface TrackCreationParameters {
  trackRequest: object;
  setTrackRequest: (req: object) => void;
  setProviderKey: (key: string) => void;
}


const TrackCreationScreen = (): JSX.Element => {
  const history = useHistory()
  const dispatch = useDispatch()

  const tracks = selectTracks()
  const allArtists = selectArtists()
  const apiManager = selectApiManager()

  const [trackRequest, setTrackRequest] = useState({})
  const [providerKey, setProviderKey] = useState("")

  const requestServerDownload = useCallback(() => {
    if (!Objects.containsKeys(trackRequest, ['fileId', 'title', 'artistName'])) {
      Log.w("Missing keys in track adding request, refusing...")
    }

    apiManager.post('/track', {...trackRequest, providerKey}).then(([code, data]) => {
      if (code === 201) {
        const newTrack = Track.fromObject(data)
        dispatch(setTracks(Arrays.add(tracks, newTrack)))
        if (allArtists.every((a: Artist) => a.getId() !== newTrack.getArtist().getId())) {
          dispatch(setArtistsInState(Arrays.concat(allArtists, data.artists.map((a: any) => Artist.fromObject(a)))))
        }
      }
    })
    history.goBack()
  }, [ history, apiManager, trackRequest, providerKey ])

  return (
    <Screen id="AddTrackScreen" title={ _("track.creation.screen.title") } >
        <ProviderList trackRequest={trackRequest} setTrackRequest={setTrackRequest} setProviderKey={setProviderKey} />
      <div id="postActions">
        <Button icon="download" className="raised" onClick={requestServerDownload} title={_("track.creation.download")} />
      </div>
    </Screen>
  )
}

export default TrackCreationScreen