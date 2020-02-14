import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Link } from 'react-router-dom'

import { Arrays } from 'utils/Immutable'

import { selectTracks } from 'selectors/Track'
import { selectConfiguration } from 'selectors/Configuration'
import { setTracks } from 'actions/Track'
import { setInConfiguration } from 'actions/Configuration'

import TrackList from '../components/tracks/TrackList'
import TextInput from '../components/utils/TextInput'
import Switch, { SwitchState } from '../components/utils/Switch'
import CustomSelect from '../components/utils/Select'
import IconButton from '../components/utils/IconButton'

const ConfigurationSwitch = ({ title, isActive, onSwitch, enabledState, disabledState, configurationKey }) => {
  const dispatch = useDispatch()

  const handleSwitch = useCallback(value => {
    if (onSwitch) {
      onSwitch(value)
    }
    dispatch(setInConfiguration(configurationKey, value))
  })

  return (
    <Switch
      enabledState={enabledState} disabledState={disabledState} onSwitch={handleSwitch}
      title={title} isActive={isActive}
    />
  )
}

const filteredTracks = (tracks, filter) => tracks.filter(track => {
  return `${track.getArtistName()}${track.getTitle()}`.toUpperCase().indexOf(filter.toUpperCase()) > -1
})

const _sort = (providedTracks, sortOrder, type) => {
  let sortFct = () => -1

  switch (type) {
    case 'date':
      sortFct = (a, b) => new Date(a.creationDate) - new Date(b.creationDate)
      break
    case 'title':
      sortFct = (a, b) => a.title.localeCompare(b.title)
      break
  }

  const tracks = Arrays.sort(providedTracks, (a, b) => sortFct(a, b))
  if (sortOrder == 'ASC') {
    return Arrays.reverse(tracks)
  } else {
    return tracks
  }
}

const TracksScreen = () => {
  const dispatch = useDispatch()

  const configuration = selectConfiguration()
  const tracks = selectTracks()

  const [ filter, setFilter ] = useState('')
  const [ sortType, setSortType ] = useState(configuration['sortType'])
  const [ sortOrder, setSortOrder ] = useState(configuration['sortOrder'])
  const [ displayType, setDisplayType ] = useState(configuration['displayType'])

  const changeTrackDisplay = useCallback(type => {
    setDisplayType(type)
    dispatch(setInConfiguration('displayType', type))
  })

  const sort = type => {
    setSortType(type)
    dispatch(setTracks(_sort(tracks, sortOrder, type)))
  }

  const switchOrder = useCallback(value => {
    dispatch(setTracks(Arrays.reverse(tracks)))
    setSortOrder(value)
  })

  useEffect(() => {
    if (window.innerWidth <= 768) {
      let prevScrollpos = document.getElementById('itemList').scrollTop

      document.getElementById('itemList').onscroll = function() {
        let currentScrollPos = document.getElementById('itemList').scrollTop
        if (prevScrollpos > currentScrollPos) {
          document.getElementById('contentHeader').style.top = '0'
        } else {
          document.getElementById('contentHeader').style.top = '-200px'
        }
        prevScrollpos = currentScrollPos
      }
    }
  }, [])

  return (
    <div id="trackScreen" >
      <div id="contentHeader">
        <h1>Titres</h1>
        <div id="toolBar">
          <div className="searchbar">
            <TextInput id="trackSearch" icon="search" onInput={setFilter} />
          </div>
          <div id="sortBar" >
            <CustomSelect onSelection={sortType => sort(sortType)} icon="" placeholder="Order" >
              <option value="title">By title</option>
              <option value="date">By date of download</option>
            </CustomSelect>
            <ConfigurationSwitch
              enabledState={new SwitchState('sort-amount-up', 'ASC')} disabledState={new SwitchState('sort-amount-down', 'DESC')}
              onSwitch={switchOrder} configurationKey="sortOrder" title="Sort order"
            />
          </div>
          <div className="displayActions">
            <ConfigurationSwitch
              enabledState={new SwitchState('random active', true)} disabledState={new SwitchState('random', false)}
              title="Switch track playing mode" configurationKey="shuffleMode" isActive={configuration['shuffleMode'] === true}
            />
            <IconButton
              icon="list" data="itemList" onClick={changeTrackDisplay}
              title="Track list"
            />
            <IconButton
              icon="th" data="itemBlocks" onClick={changeTrackDisplay}
              title="Track blocks"
            />
            <IconButton
              icon="stream" data="groupedItems" onClick={changeTrackDisplay}
              title="Tracks for each artist"
            />
          </div>
        </div>
      </div>
      <div className="delimiter" />
      <TrackList tracks={filteredTracks(tracks, filter)} displayType={displayType} withArtist />
      <Link to={'/track/create'} ><div className="button icon floating"><i className="fa fa-plus icon" /></div></Link>
    </div>
  )
}

export default TracksScreen