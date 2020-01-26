import React, { useCallback, useState } from 'react'

const TrackCreationScreen = () => {
  const [ videoId, setVideoId ] = useState('')

  const handleInput = useCallback(event => setVideoId(event.target.value))
  
  const requestServerDownload = useCallback(() => {
    apiManager.post(`file/${videoId}`)
  })
  
  return (
    <div id="AddTrackScreen" >
      <div id="modificationPageHeader">
        <h2 id="modificationPageTitle">Add a new track</h2>
        <div className="button raised" onClick={requestServerDownload} >Download</div>
      </div>
      <div className="input">
        <i className="fab fa-youtube fa-2x icon" />
        <input
          type="text" className="form-data" onInput={handleInput}
          id="videoId" defaultValue="" placeholder="Youtube video ID"
        />
      </div>
    </div>
    )
  }
  
  export default TrackCreationScreen