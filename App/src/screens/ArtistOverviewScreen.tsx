import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JWT from 'jwt-client'

import StringUtils from '@utils/StringUtils'
import ColorUtils from '@utils/ColorUtils'
import KeyboardManager from '@utils/KeyboardManager'
import { QueryParameters } from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

import { selectArtist } from '@selectors/Artist'
import { selectTracks } from '@selectors/Track'
import { selectConfiguration } from '@selectors/Configuration'
import { selectApiManager } from '@selectors/App'

import CloseButton from '@components/CloseButton'
import TrackList from '@components/TrackList'
import Button from '@components/Button'

const ArtistOverviewScreen = (): JSX.Element => {
  const { id } = useParams<QueryParameters>()

  if (id && StringUtils.isNumber(id)) {
    const apiManager = selectApiManager()
    const artist = selectArtist(parseInt(id))
    const tracks = selectTracks().filter((track => track.getArtist().getId() === parseInt(id)))
    const configuration = selectConfiguration()
    const [background, setBackground] = useState({})

    useEffect(() => apiManager.getImage(
      `${configuration.getServerAddress()}/api/artist/${artist.getId()}/image`,
      (url: string) => setBackground({ backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url(${url})` }),
      () => setBackground({ backgroundColor: ColorUtils.getRandomColor() })
    ), [])

    KeyboardManager.addMainNodes(tracks, {containerLevel: 3})

    if (artist) {
      return (
        <div id="artistOverviewScreen" className="screen" >
          <CloseButton additionalClass="floating mini top" />
          <div id="artistScreenHeader" style={background}  >
            <h1>{artist.getName()}</h1>
          </div>

          <div id="titlesHeader" >
            <h2>{ _("artist.overview.tracks.title") }</h2>
            <div className="displayActions">
              <Link to={`/modify/artist/${artist.getId()}`}><Button icon="edit" title={_("artist.overview.edit.button")} /></Link>
            </div>
          </div>
          <div className="delimiter" />

          <TrackList tracks={tracks} height={360} className="artistTrackList itemList" />
        </div>
      )
    }
  }

  return (
    <div className="screen uniqueCentered" >
      <h2>Artist not found</h2>
    </div>
  )
}

export default ArtistOverviewScreen