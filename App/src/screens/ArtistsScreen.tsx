import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import JWT from 'jwt-client'

import { selectArtists } from '@selectors/Artist'
import { selectConfiguration } from '@selectors/Configuration'
import { selectApiManager } from '@selectors/App'

import KeyboardManager, { AppIds } from '@utils/KeyboardManager'
import { getFromSession, bindToSession } from '@utils/SessionUtils'
import { _ } from '@utils/TranslationUtils'

import TextInput from '@components/TextInput'
import Button from '@components/Button'

const ArtistsScreen = (): JSX.Element => {
  const ref = useRef(null)

  const configuration = selectConfiguration()
  const apiManager = selectApiManager()
  const artists = selectArtists()
  const [ filter, setFilter ] = useState(getFromSession('artistsFilter'))
  bindToSession('artistsFilter', filter)

  const handleFilter = useCallback(value => {
    setFilter(value)
    sessionStorage.setItem('artistsFilter', value)
  }, [])

  const filtered = artists.filter(artist => artist.getName().toUpperCase().indexOf(filter.toUpperCase()) > -1)
  const artistsComponents = filtered.map(artist => {
    const id = KeyboardManager.getId(artist)
    useEffect(() => apiManager.getImage(`${configuration.getServerAddress()}/api/artist/${artist.getId()}/image`, (url) => {
      const img = document.getElementById(id)
      img.style.backgroundImage = `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url(${url})`
    }), [])
    return (
      <div id={id} className="artistListItem" key={artist.getId()} >
        <Link id={KeyboardManager.getClickId(artist)} to={`/artist/${artist.getId()}`} className="link" >
          <h5 className="artistName">{ artist.getName() }</h5>
        </Link>
        <div className="artistActions">
          <Link to={`/modify/artist/${artist.getId()}`}><Button className="floating mini" icon="pen" /></Link>
        </div>
      </div>
    )
  })

  bindToSession('artistsScroll', () => ref.current.scrollTop, (value) => ref.current.scrollTo({top: value}))

  KeyboardManager.addMainNodes(artists, {ref, redirectTo: AppIds.NO_OPERATION, withDifferentClickable: true}, 220)

  return (
    <div id="artistScreen" className="screen" >
      <div id="contentHeader">
        <h1>{ _("artists.screen.title") }</h1>
        <div className="searchbar">
          <TextInput id="trackSearch" icon="search" initialValue={filter} placeHolder="artists.search.placeholder" onInput={handleFilter} />
        </div>
      </div>
      <div className="delimiter" />
      <div ref={ref} className="itemBlocks">{ artistsComponents }</div>
      <Link to={'/artist/create'} ><Button className="floating" icon="plus" /></Link>
    </div>
  )
}

  export default ArtistsScreen