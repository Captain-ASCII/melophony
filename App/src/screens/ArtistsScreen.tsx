import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import JWT from 'jwt-client'

import { selectArtists } from '@selectors/Artist'
import { selectConfiguration } from '@selectors/Configuration'

import KeyboardManager, { AppIds } from '@utils/KeyboardManager'

import TextInput from '@components/TextInput'
import IconButton from '@components/IconButton'

const ArtistsScreen = (): JSX.Element => {
  const ref = useRef(null)

  const configuration = selectConfiguration()
  const artists = selectArtists()
  const [ filter, setFilter ] = useState('')

  const handleFilter = useCallback(value => setFilter(value), [])

  const filtered = artists.filter(artist => artist.getName().toUpperCase().indexOf(filter.toUpperCase()) > -1)
  const artistsComponents = filtered.map(artist => {
    const imageBackground = artist.getImageName() != null
      ? { backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url(${configuration.getServerAddress()}/artist/image/${artist.getImageName()}?jwt=${JWT.get()})`}
      : {}
    return (
      <div id={KeyboardManager.getId(artist)} className="artistListItem" key={artist.getId()} style={imageBackground} >
        <Link id={KeyboardManager.getClickId(artist)} to={`/artist/${artist.getId()}`} className="link" >
          <h5 className="artistName">{ artist.getName() }</h5>
        </Link>
        <div className="artistActions">
          <Link to={`/modify/artist/${artist.getId()}`}><IconButton className="floating mini" icon="pen" /></Link>
        </div>
      </div>
    )
  })

  useEffect(() => {
    const scroll = sessionStorage.getItem('artistsScroll')
    if (scroll) {
      ref.current.scrollTo({top: scroll})
    }
    return () => sessionStorage.setItem('artistsScroll', ref.current.scrollTop)
  }, [])

  KeyboardManager.addMainNodes(artists, {ref, redirectTo: AppIds.NO_OPERATION, withDifferentClickable: true}, 220)

  return (
    <div id="artistScreen" className="screen" >
      <div id="contentHeader">
        <h1>Artistes</h1>
        <div className="searchbar">
          <TextInput id="trackSearch" icon="search" onInput={handleFilter} />
        </div>
      </div>
      <div className="delimiter" />
      <div ref={ref} className="itemBlocks">{ artistsComponents }</div>
      <Link to={'/artist/create'} ><div className="button icon floating"><i className="fa fa-plus icon" /></div></Link>
    </div>
  )
}

  export default ArtistsScreen