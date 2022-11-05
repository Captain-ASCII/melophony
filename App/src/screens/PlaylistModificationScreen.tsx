import React, { useCallback, useState, useEffect } from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

import { Arrays } from '@utils/Immutable'
import { QueryParameters } from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

import Playlist from '@models/Playlist'
import Track from '@models/Track'

import {
  addPlaylist as addPlaylistInGlobalState,
  setPlaylist as setPlaylistInGlobalState,
  removePlaylist as removePlaylistInGlobalState,
} from '@actions/Playlist'

import { selectApiManager } from '@selectors/App'
import { selectTracks } from '@selectors/Track'
import { selectPlaylist } from '@selectors/Playlist';

import Button from '@components/Button'
import CheckableItemList from '@components/CheckableItemList'
import Screen from '@components/Screen'
import Overlay from '@components/Overlay'
import TextInput from '@components/TextInput'
import ImageSearcher from '@components/ImageSearcher'


const filteredTracks = (tracks: Array<Track>, filter: string): Array<Track> => tracks.filter((track: Track) =>
  `${track.getArtist().getName()}${track.getTitle()}`.toUpperCase().indexOf(filter.toUpperCase()) > -1)


const AddTrackOverlayHeader = ({ filter }: { filter: (v: string) => void }): JSX.Element => {
  return (
    <div className="playlistAddTrackHeader" >
      <h3 style={{margin: 10}}>{ _("playlist.modification.add.tracks.header") }</h3>
      <TextInput icon="filter" onInput={filter} />
    </div>
  )
}

const TrackList = SortableContainer(({ playlist, removeTrack }: { playlist: Playlist, removeTrack: (i: number) => void }): JSX.Element => {
  return (
    <div className="playlistTracksContainer" >
      {playlist.getTracks().map((track: Track, index: number) => <TrackItem key={track.getId()} track={track} removeTrack={removeTrack} index={index} trackIndex={index} />)}
    </div>
  )
})

const TrackItem = SortableElement(({ track, trackIndex, removeTrack }: { track: Track; trackIndex: number; removeTrack: (i: number) => void }): JSX.Element => {
  return (
    <div className="playlistTrack" key={track.getId()} >
      <TrackHandle />
      <p>{track.getArtist().getName()}</p>
      <p>{track.getTitle()}</p>
      <Button onClick={() => removeTrack(trackIndex)} icon="times" />
    </div>
  )
})

const TrackHandle = SortableHandle(() => <i className="fa fa-bars fa-2x"></i>)

const PlaylistModificationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { id } = useParams<QueryParameters>()
  const location = useLocation()

  const apiManager = selectApiManager()
  const tracks = selectTracks()

  const [overlayVisible, setOverlay] = useState(false)
  const [visibleTracks, setVisibleTracks] = useState(tracks)
  const [selectedTracks, setSelectedTracks] = useState([])
  const basePlaylist = location.pathname === '/playlist/create' ? Playlist.default() : selectPlaylist(parseInt(id))
  const [playlist, setPlaylist] = useState(basePlaylist)

  const handlePlaylistTitleChange = useCallback((title: string) => setPlaylist(playlist.withName(title)), [playlist, setPlaylist])

  const addTracks = useCallback(() => {
    setPlaylist(playlist.withTracks(selectedTracks))
    setOverlay(false)
  }, [playlist, setPlaylist, selectedTracks]);

  const removeTrack = useCallback((index: number) => {
    setPlaylist(playlist.withTracks(Arrays.removeAt(playlist.getTracks(), index)))
  }, [playlist, setPlaylist]);

  const sortPlaylist = useCallback(({ oldIndex, newIndex }) => {
    setPlaylist(playlist.withTracks(arrayMoveImmutable(playlist.getTracks(), oldIndex, newIndex)))
  }, [playlist, setPlaylist]);

  const savePlaylist = useCallback(() => {
    const id = playlist.getId();
    const modifications = {
      name: playlist.getName(),
      tracks: playlist.getTracks().map(t => t.getId()),
      imageUrl: playlist.getImageUrl(),
    }
    if (id === -1) {
      apiManager.post('/playlist', modifications).then(([code, data]) => {
        if (code === 201) {
          dispatch(addPlaylistInGlobalState(Playlist.fromObject(data)))
        }
      })
    } else {
      apiManager.put(`/playlist/${id}`, modifications).then(([code, data]) => {
        dispatch(setPlaylistInGlobalState(Playlist.fromObject(data)))
      })
    }
    history.goBack()
  }, [apiManager, playlist])

  const deletePlaylist = () => {
    apiManager.delete(`/playlist/${id}`)
    dispatch(removePlaylistInGlobalState(playlist))
    history.goBack()
  }

  const showOverlay = useCallback(() => setOverlay(true), [])

  const onTracksFilter = useCallback((filter: string) => setVisibleTracks(filteredTracks(tracks, filter)), [])
  const onTracksSelection = useCallback((tracks: Array<Track>) => setSelectedTracks(tracks), [])
  const onImageSelected = useCallback((url: string) => setPlaylist(playlist.withImageUrl(url)), [playlist])

  const renderTrack = useCallback((track: Track) => {
    return (
      <div className="overlayTrack" >
        <p className="overlayTrackArtist">{track.getArtist().getName()}</p>
        <p>{track.getTitle()}</p>
      </div>
    )
  }, [])

  return (
    <Screen title={ _("playlist.modification.screen.title") }>
      <div className="input">
        <i className="fa fa-fingerprint fa-2x icon" />
        <TextInput placeHolder={"playlist.modification.playlist.name.placeholder"} initialValue={playlist.getName()} onInput={handlePlaylistTitleChange} />
      </div>
      <div className="input">
        <i className="fa fa-music fa-2x icon" />
        <TrackList playlist={playlist} removeTrack={removeTrack} onSortEnd={sortPlaylist} lockAxis="y" lockToContainerEdges lockOffset="0%" useDragHandle />
        <Button title={_("playlist.modification.add.tracks.button")} icon="plus" onClick={showOverlay} className="responsiveShrink" />
        <Overlay isOpen={overlayVisible} onChange={setOverlay} className="addTrackOverlay" >
          <div>
            <AddTrackOverlayHeader filter={onTracksFilter} />
          </div>
          <CheckableItemList
            items={visibleTracks} initialItems={playlist.getTracks()} checkMethod={(l, r) => l.getId() === r.getId()}
            onSelect={onTracksSelection} renderItem={renderTrack}
          />
          <div>
            <Button title={_("playlist.modification.add.tracks.button")} icon="plus" className="raised" onClick={addTracks} />
          </div>
        </Overlay>
      </div>
      <div className="input">
        <i className="fa fa-image fa-2x icon" />
        <ImageSearcher initialQuery={playlist.getName()} onSelect={onImageSelected} />
      </div>
      <div id="postActions" >
        { id && <Button icon="trash" className="raised alert" onClick={deletePlaylist} title={_("playlist.modification.button.delete")} /> }
        <Button icon="save" className="raised" onClick={savePlaylist} title={_("playlist.modification.button.save")} />
      </div>
    </Screen>
  )
}

export default PlaylistModificationScreen