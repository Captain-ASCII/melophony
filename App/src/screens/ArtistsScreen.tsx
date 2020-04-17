import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { selectArtists } from '@selectors/Artist'

import TextInput from '@components/TextInput'

const ArtistsScreen = (): JSX.Element => {
  const artists = selectArtists()
  const [ filter, setFilter ] = useState('')

  const handleFilter = useCallback(value => setFilter(value), [])

  const filtered = artists.filter(artist => artist.getName().toUpperCase().indexOf(filter.toUpperCase()) > -1)
  const artistsComponents = filtered.map(artist => {
    return (
      <div className="artistListItem" key={artist.getId()} >
        <Link to={`/artist/${artist.getId()}`} className="link" >
          <div className="name">
            <p>{ artist.getName() }</p>
          </div>
        </Link>
        <div className="artistActions">
          <Link to={`/modify/artist/${artist.getId()}`}><i className="fa fa-pen icon" /></Link>
        </div>
      </div>
    )
  })

  return (
    <div id="artistScreen" className="screen" >
      <div id="contentHeader">
        <h1>Artistes</h1>
        <div className="searchbar">
          <TextInput id="trackSearch" icon="search" onInput={handleFilter} />
        </div>
      </div>
      <div className="delimiter" />
      <div id="itemBlocks">{ artistsComponents }</div>
    </div>
  )
}

  export default ArtistsScreen