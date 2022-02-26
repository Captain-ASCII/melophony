import React, { useCallback, useState } from 'react'

import { Arrays } from '@utils/Immutable'

import { selectApiManager } from '@selectors/App'

import IconButton from '@components/IconButton'

const TrackSharingScreen = (): JSX.Element => {

  const apiManager = selectApiManager()

  const [ userFilter, setUserFilter ] = useState('')
  const [ users, setUsers ] = useState([])

  const handleInput = useCallback(event => setUserFilter(event.target.value), [])
  const addUser = useCallback(async () => {
    // if (await apiManager.get(`/user/${userFilter}`)) {
    setUsers(Arrays.add(users, userFilter))
    // }
  }, [ apiManager, userFilter, users ])

  return (
    <div id="trackSharingScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Share playlists, listen together</h2>
      </div>
      <div className="input">
        <i className="fa fa-user fa-2x icon" />
        <input
          type="text" className="form-data" onInput={handleInput}
          id="videoId" defaultValue="" placeholder="User ID"
        />
        <IconButton icon="plus" onClick={addUser} />
      </div>
      <div>
        { users.map(user => <p key={user} >{ user }</p>) }
      </div>
    </div>
  )
}

export default TrackSharingScreen