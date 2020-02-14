import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { selectArtists } from 'selectors/Artist'

import TextInput from './../components/utils/TextInput'

const ArtistsScreen = () => {
  const artists = selectArtists()
  const [ filter, setFilter ] = useState('')

  const handleFilter = useCallback(event => setFilter(event.target.value))

  const filtered = artists.filter(artist => artist.name.toUpperCase().indexOf(filter.toUpperCase()) > -1)
  const artistsComponents = filtered.map(artist => {
    return (
      <div className="artistListItem" key={artist.id} >
        <Link to={`/artist/${artist.id}`} class="link" >
          <div className="name">
            <p>{ artist.name }</p>
          </div>
        </Link>
        <div className="artistActions">
          <Link to={`/modify/artist/${artist.id}`}><i className="fa fa-pen icon" /></Link>
        </div>
      </div>
    )
  })

  return (
    <div id="artistScreen">
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