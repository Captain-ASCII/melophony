import React, {  } from 'react'
import { Link, useParams } from 'react-router-dom'

import { selectArtist } from 'selectors/Artist'
import { selectTracksOfArtist } from 'selectors/Track'

import CloseButton from 'components/CloseButton'
import TrackList from 'components/TrackList'

const ArtistOverviewScreen = () => {
  const { id } = useParams()

  const artist = selectArtist(id)
  const tracks = selectTracksOfArtist(id)

  return (
    <div id="artistOverviewScreen">
      <CloseButton icon="chevron-left" additionalClass="floating mini top transparent" />
      <div id="artistScreenHeader">
        <h1>{artist.getName()}</h1>
      </div>

      <div id="contentHeader">
        <h2>Titres</h2>
        <div className="displayActions">
          <Link to={`/modify/artist/${artist.getId()}`}><i className="fa fa-edit icon button" title="Edit artist data"  /></Link>
        </div>
      </div>
      <div className="delimiter" />

      <TrackList tracks={tracks} displayType="itemList" filter="" />
    </div>
  )
}

export default ArtistOverviewScreen