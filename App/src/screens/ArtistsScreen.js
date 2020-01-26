import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import TextInput from './../components/utils/TextInput'

export default class ArtistsScreen extends Component {

    constructor(props) {
        super(props)

        this.artists = global.dataStorage.getAsArray('artists')
        this.state = { filter: '' }
    }

    filter(text) {
        this.setState({ filter: text })
    }

    render() {
        let filtered = this.artists.filter(artist => artist.name.toUpperCase().indexOf(this.state.filter.toUpperCase()) > -1)
        let artists = filtered.map(artist => {
            return (
              <div className="artistListItem" key={artist.id} >
                <Link to={`/artist/${artist.id}`} class="link" >
                  <div className="name">
                    <p>{ artist.name }</p>
                  </div>
                </Link>
                <div className="artistActions">
                  <Link to={`/modify/artist/${artist.id}`}><i className="fa fa-pen icon" /></Link>
                </div>
              </div>
            )
        })

        return (
          <div id="artistScreen">
            <div id="contentHeader">
              <h1>Artistes</h1>
              <div className="searchbar">
                <TextInput id="trackSearch" icon="search" onInput={text => this.filter(text)} />
              </div>
              <div className="displayActions">
                {/*<Switch icon="random" title="Switch track playing mode" active={configurationManager.get("shuffleMode")} configurationSwitch="shuffleMode" />
                        <i class="fa fa-list icon button" onClick={ _ => this.changeTrackDisplay("itemList") } title="Track list" ></i>
                        <i class="fa fa-th icon button" onClick={ _ => this.changeTrackDisplay("itemBlocks") } title="Track blocks" ></i>
                        <i class="fa fa-stream icon button" onClick={ _ => this.changeTrackDisplay("groupedItems") } title="Tracks for each artist" ></i>*/}
              </div>
            </div>
            <div className="delimiter" />
            <div id="itemBlocks">{ artists }</div>
          </div>
        )
    }
}