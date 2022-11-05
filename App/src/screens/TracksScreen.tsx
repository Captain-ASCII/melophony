import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Link } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'
import KeyboardManager, { AppIds } from '@utils/KeyboardManager'
import { bindToSession, getFromSession } from '@utils/SessionUtils'
import { _ } from "@utils/TranslationUtils"

import Track from '@models/Track'

import { selectConfiguration } from '@selectors/Configuration'
import { selectPlaylistManager, selectKeyboardManager } from '@selectors/App'
import { selectTracks } from '@selectors/Track'

import { setConfiguration } from '@actions/Configuration'
import { setPlaylistManager, setKeyboardManager } from '@actions/App'

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
    case 'artist':
      sortFct = (a:Track, b: Track): number => a.getArtist().getName().localeCompare(b.getArtist().getName())
      break
    case 'duration':
      sortFct = (a:Track, b: Track): number => a.getDuration() - b.getDuration()
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

  const configuration = selectConfiguration()
  const keyboardManager = selectKeyboardManager()
  const tracks = selectTracks()
  const playlist = selectPlaylistManager()

  const [filter, setFilter] = useState("")
  const [sortOrder, setSortOrder] = useState(configuration.getSortOrder())
  const [sortType, setSortType] = useState(configuration.getSortType())

  const fullSort = (filter: string, sortOrder: string, sortType: string) => _sort(filteredTracks(tracks, filter), sortOrder, sortType)

  const [displayedTracks, setDisplayedTracks] = useState(fullSort(filter, sortOrder, sortType))

  const handleSetType = useCallback(type => {
    setSortType(type)
    dispatch(setConfiguration(configuration.withSortType(type)))
    setDisplayedTracks(fullSort(filter, sortOrder, type))
  }, [ dispatch, configuration, tracks, filter, sortOrder, sortType ])

  const handleSwitchOrder = useCallback((value: string) => {
    setSortOrder(value)
    setDisplayedTracks(fullSort(filter, value, sortType))
    dispatch(setConfiguration(configuration.withSortOrder(value)))
    dispatch(setKeyboardManager(keyboardManager.goTo(AppIds.NO_OPERATION)))
  }, [ dispatch, configuration, displayedTracks, filter, sortOrder, sortType ])

  const handleSwitchMode = useCallback((value: boolean) => {
    dispatch(setConfiguration(configuration.withShuffleMode(value)))
    dispatch(setPlaylistManager(playlist.withShuffleMode(value)))
  }, [ dispatch, configuration, playlist ])

  const handleFilterSet = useCallback((filter: string) => {
    setFilter(filter)
    setDisplayedTracks(fullSort(filter, sortOrder, sortType))
  }, [ setFilter, filter, sortOrder, sortType ])

  KeyboardManager.addMainNodes(displayedTracks, {top: AppIds.MELOPHONY, left: AppIds.MENU, containerLevel: 2})

  return (
    <div id="trackScreen" className="screen" >
      <div id="contentHeader">
        <h1>{ _("tracks.title") }</h1>
        <div id="toolBar">
          <div className="searchbar">
            <TextInput id="trackSearch" icon="search" initialValue={filter} placeHolder="tracks.search.placeholder" onInput={handleFilterSet} />
          </div>
          <div id="sortBar" >
            <CustomSelect onSelection={handleSetType} icon="" placeholder={_(`tracks.sort.option.${configuration.getSortType()}`)} >
              <option value="title">{_("tracks.sort.option.title")}</option>
              <option value="date">{_("tracks.sort.option.date")}</option>
              <option value="artist">{_("tracks.sort.option.artist")}</option>
              <option value="duration">{_("tracks.sort.option.duration")}</option>
            </CustomSelect>
            <Switch
              enabledState={new SwitchState('sort-amount-up', 'ASC')} disabledState={new SwitchState('sort-amount-down', 'DESC')}
              onSwitch={handleSwitchOrder} initial={configuration.getSortOrder()}
            />
          </div>
          <div className="displayActions">
            <Switch
              enabledState={new SwitchState('random active', true)} disabledState={new SwitchState('random', false)}
              onOff onSwitch={handleSwitchMode} initial={configuration.getShuffleMode()}
            />
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