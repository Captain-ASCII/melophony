import React, { Component } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { selectArtist } from 'selectors/Artist'

import CloseButton from '../components/utils/CloseButton'
import TrackList from '../components/tracks/TrackList'

const ArtistOverviewScreen = () => {
  const { artistId } = useParams()
  const artist = useSelector(selectArtist(artistId))
  const tracks = useSelector(state => state.tracks).filter(track => track.artist === artistId)
  
  return (
    <div id="artistOverviewScreen">
      <CloseButton icon="chevron-left" additionalClass="floating mini top transparent" />
      <div id="artistScreenHeader">
        <h1>{artist.getName()}</h1>
      </div>
    
      <div id="contentHeader">
        <h2>Titres</h2>
        <div className="displayActions">
          <Link to={`/artist/modify/${artist.getId()}`}><i className="fa fa-edit icon button" title="Edit artist data"  /></Link>
        </div>
      </div>
      <div className="delimiter" />
    
      <div id="itemList">
        <TrackList tracks={tracks} displayType="itemList" filter="" />
      </div>
    </div>
  )
}

export default ArtistOverviewScreen