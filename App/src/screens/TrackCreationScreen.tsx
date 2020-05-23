import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { selectApiManager } from '@selectors/App'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'

const TrackCreationScreen = (): JSX.Element => {
  const history = useHistory()

  const apiManager = selectApiManager()

  const [ videoId, setVideoId ] = useState('')

  const handleInput = useCallback(event => setVideoId(event.target.value), [])

  const requestServerDownload = useCallback(() => {
    apiManager.post('/track', { videoId })
    history.goBack()
  }, [ history, apiManager, videoId ])

  return (
    <div id="AddTrackScreen" className="screen" >
      <div id="preActions">
        <CloseButton />
      </div>
      <div id="pageHeader">
        <h2 id="pageTitle">Add a new track</h2>
      </div>
      <div className="input">
        <i className="fab fa-youtube fa-2x icon" />
        <input
          type="text" className="form-data" onInput={handleInput}
          id="videoId" defaultValue="" placeholder="Youtube video ID"
        />
      </div>
      <div id="postActions">
        <Button icon="download" className="raised" onClick={requestServerDownload} title="Download" />
      </div>
    </div>
  )
}

export default TrackCreationScreen