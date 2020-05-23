import React, {  } from 'react'
import { Link, useParams } from 'react-router-dom'

import StringUtils from '@utils/StringUtils'
import ColorUtils from '@utils/ColorUtils'

import { selectArtist } from '@selectors/Artist'
import { selectTracksOfArtist } from '@selectors/Track'

import CloseButton from '@components/CloseButton'
import TrackList from '@components/TrackList'
import IconButton from '@components/IconButton'

const ArtistOverviewScreen = (): JSX.Element => {
  const { id } = useParams()

  if (id && StringUtils.isNumber(id)) {
    const artist = selectArtist(parseInt(id))
    const tracks = selectTracksOfArtist(parseInt(id))

    return (
      <div id="artistOverviewScreen" className="screen" >
        <CloseButton additionalClass="floating mini top transparent" />
        <div id="artistScreenHeader" style={{ backgroundColor: ColorUtils.getRandomColor() }}  >
          <h1>{artist.getName()}</h1>
        </div>

        <div id="titlesHeader" >
          <h2>Titres</h2>
          <div className="displayActions">
            <Link to={`/modify/artist/${artist.getId()}`}><IconButton icon="edit" title="Edit artist data" /></Link>
          </div>
        </div>
        <div className="delimiter" />

        <TrackList tracks={tracks} displayType="itemList" />
      </div>
    )
  }

  return <div>Artist not found</div>
}

export default ArtistOverviewScreen