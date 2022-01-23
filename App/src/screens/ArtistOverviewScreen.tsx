import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JWT from 'jwt-client'

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

    const [background, setBackground] = useState({})

    useEffect(() => {
      setBackground(artist.getImageName() !== null
        ? { backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url(http://localhost:1804/artist/image/${artist.getImageName()}?jwt=${JWT.get()})`}
        : { backgroundColor: ColorUtils.getRandomColor() }
      )
    }, [])

    return (
      <div id="artistOverviewScreen" className="screen" >
        <CloseButton additionalClass="floating mini top" />
        <div id="artistScreenHeader" style={background}  >
          <h1>{artist.getName()}</h1>
        </div>

        <div id="titlesHeader" >
          <h2>Titres</h2>
          <div className="displayActions">
            <Link to={`/modify/artist/${artist.getId()}`}><IconButton icon="edit" title="Edit artist data" /></Link>
          </div>
        </div>
        <div className="delimiter" />

        <TrackList tracks={tracks} displayType="itemList" className="artistTrackList" />
      </div>
    )
  }

  return <div>Artist not found</div>
}

export default ArtistOverviewScreen