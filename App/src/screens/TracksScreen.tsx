import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Link } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'
import KeyboardManager, { AppIds } from '@utils/KeyboardManager'
import { bindToSession, getFromSession } from '@utils/SessionUtils'

import Track from '@models/Track'

import { selectConfiguration } from '@selectors/Configuration'
import { selectPlaylistManager, selectKeyboardManager } from '@selectors/App'
import { selectTracks } from '@selectors/Track'

import { setConfiguration } from '@actions/Configuration'
import { setPlaylistManager, setKeyboardManager } from '@actions/App'
import { setTracks } from '@actions/Track'

import CustomSelect from '@components/Select'
import Switch, { SwitchState } from '@components/Switch'
import TextInput from '@components/TextInput'
import TrackList from '@components/TrackList'

const filteredTracks = (tracks: Array<Track>, filter: string): Array<Track> => tracks.filter((track: Track) =>
  `${track.getArtist().getName()}${track.getTitle()}`.toUpperCase().indexOf(filter.toUpperCase()) > -1)

function _sort(providedTracks: Array<Track>, sortOrder: string, type: string): Array<Track> {
  let sortFct: (a: Track, b: Track) => number

  switch (type) {
    case 'date':
      sortFct = (a: Track, b: Track): number => a.getCreationDate().getTime() - b.getCreationDate().getTime()
      break
    case 'title':
      sortFct = (a: Track, b: Track): number => a.getTitle().localeCompare(b.getTitle())
      break
    default:
      sortFct = (): number => -1
  }

  const tracks = Arrays.sort(providedTracks, (a, b) => sortFct(a, b))
  if (sortOrder == 'ASC') {
    return Arrays.reverse(tracks)
  } else {
    return tracks
  }
}

const TracksScreen = (): JSX.Element => {
  const dispatch = useDispatch()

  const [filter, setFilter] = useState(getFromSession('tracksFilter'))
  bindToSession('tracksFilter', filter)

  const keyboardManager = selectKeyboardManager()
  const configuration = selectConfiguration()
  const tracks = selectTracks()
  const playlist = selectPlaylistManager()

  const [displayedTracks, setDisplayedTracks] = useState(
    _sort(filteredTracks(tracks, filter), configuration.getSortOrder(), configuration.getSortType())
  )

  const changeTrackDisplay = useCallback(type => {
    dispatch(setConfiguration(configuration.withDisplayType(type)))
  }, [ dispatch, configuration ])

  const sort = useCallback(type => {
    dispatch(setConfiguration(configuration.withSortType(type)))
    dispatch(setDisplayedTracks(_sort(tracks, configuration.getSortOrder(), type)))
  }, [ dispatch, configuration, tracks ])

  const switchOrder = useCallback((value: string) => {
    setDisplayedTracks(Arrays.reverse(displayedTracks))
    dispatch(setConfiguration(configuration.withSortOrder(value)))
    dispatch(setKeyboardManager(keyboardManager.goTo(AppIds.NO_OPERATION)))
  }, [ dispatch, configuration, displayedTracks ])

  const switchMode = useCallback((value: boolean) => {
    dispatch(setConfiguration(configuration.withShuffleMode(value)))
    dispatch(setPlaylistManager(playlist.withShuffleMode(value)))
  }, [ dispatch, configuration, playlist ])

  const handleFilterSet = useCallback((filter: string) => {
    sessionStorage.setItem('tracksFilter', filter)
    setFilter(filter)
  }, [ setFilter ])

  KeyboardManager.addMainNodes(displayedTracks, {top: AppIds.MELOPHONY, left: AppIds.MENU, containerLevel: 2})

  return (
    <div id="trackScreen" className="screen" >
      <div id="contentHeader">
        <h1>Titres</h1>
        <div id="toolBar">
          <div className="searchbar">
            <TextInput id="trackSearch" icon="search" initialValue={filter} onInput={handleFilterSet} />
          </div>
          <div id="sortBar" >
            <CustomSelect onSelection={sort} icon="" placeholder="Order" >
              <option value="title">By title</option>
              <option value="date">By date of download</option>
            </CustomSelect>
            <Switch
              enabledState={new SwitchState('sort-amount-up', 'ASC')} disabledState={new SwitchState('sort-amount-down', 'DESC')}
              title="Sort order" onSwitch={switchOrder} initial={configuration.getSortType()}
            />
          </div>
          <div className="displayActions">
            <Switch
              enabledState={new SwitchState('random active', true)} disabledState={new SwitchState('random', false)}
              onOff title="Switch track playing mode" onSwitch={switchMode} initial={configuration.getShuffleMode()}
            />
            { /*
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
            */ }
          </div>
        </div>
      </div>
      <div className="delimiter" />
      <TrackList height={1000} tracks={displayedTracks} className="itemList" />
      <Link to={'/track/create'} ><div className="button icon floating"><i className="fa fa-plus icon" /></div></Link>
    </div>
  )
}

export default TracksScreen