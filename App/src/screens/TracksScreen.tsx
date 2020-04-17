import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Link } from 'react-router-dom'

import { Arrays } from '@utils/Immutable'

import Track from '@models/Track'

import { setConfiguration } from '@actions/Configuration'

import { selectTracks } from '@selectors/Track'
import { selectConfiguration } from '@selectors/Configuration'
import { setTracks } from '@actions/Track'

import TrackList from '@components/TrackList'
import TextInput from '@components/TextInput'
import Switch, { SwitchState } from '@components/Switch'
import CustomSelect from '@components/Select'
import IconButton from '@components/IconButton'

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

  const configuration = selectConfiguration()
  const tracks = selectTracks()

  const [ filter, setFilter ] = useState('')

  const changeTrackDisplay = useCallback(type => {
    dispatch(setConfiguration(configuration.withDisplayType(type)))
  }, [ dispatch, configuration ])

  const sort = useCallback(type => {
    dispatch(setConfiguration(configuration.withSortType(type)))
    dispatch(setTracks(_sort(tracks, configuration.getSortOrder(), type)))
  }, [ dispatch, configuration, tracks ])

  const switchOrder = useCallback((value: string) => {
    dispatch(setTracks(Arrays.reverse(tracks)))
    dispatch(setConfiguration(configuration.withSortOrder(value)))
  }, [ dispatch, configuration, tracks ])

  const switchMode = useCallback((value: boolean) => {
    dispatch(setConfiguration(configuration.withShuffleMode(value)))
  }, [ dispatch, configuration ])

  useEffect(() => {
    if (window.innerWidth <= 768) {
      const listElement = document.getElementById('itemList')
      if (listElement) {
        let prevScrollpos = listElement.scrollTop

        listElement.onscroll = function(): void {
          const currentScrollPos = listElement.scrollTop
          const element = document.getElementById('contentHeader')
          if (element) {
            if (prevScrollpos > currentScrollPos) {
              element.style.top = '0'
            } else {
              element.style.top = '-200px'
            }
            prevScrollpos = currentScrollPos
          }
        }
      }
    }
  }, [])

  return (
    <div id="trackScreen" className="screen" >
      <div id="contentHeader">
        <h1>Titres</h1>
        <div id="toolBar">
          <div className="searchbar">
            <TextInput id="trackSearch" icon="search" onInput={setFilter} />
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
              title="Switch track playing mode" onSwitch={switchMode} initial={configuration.getShuffleMode()}
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
      <TrackList tracks={_sort(filteredTracks(tracks, filter), configuration.getSortOrder(), configuration.getSortType())}
        displayType={configuration.getDisplayType()}
      />
      <Link to={'/track/create'} ><div className="button icon floating"><i className="fa fa-plus icon" /></div></Link>
    </div>
  )
}

export default TracksScreen