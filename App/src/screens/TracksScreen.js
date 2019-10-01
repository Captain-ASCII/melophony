import React, { Component } from "react";

import TrackList from "./../components/tracks/TrackList";

export default class TracksScreen extends Component {

    constructor(props) {
        super(props);

        this.state = { groupByArtist: false };
    }

    render() {
        return (
            <div>
                <div id="contentHeader">
                    <h1>Titres</h1>
                    <div class="searchbar">
                        {/*{> TextInput id="trackSearch" icon="search"}*/}
                    </div>
                    <div class="displayActions">
                        <i class="fa fa-random icon button" onClick={ _ => this.switchTrackMode(this) } title="Switch track playing mode" ></i>
                        <i class="fa fa-list icon button" onClick={ _ => this.changeTrackDisplay('tracks') } title="Track list" ></i>
                        <i class="fa fa-th icon button" onClick={ _ => this.changeTrackDisplay('tracks') } title="Track blocks" ></i>
                        <i class="fa fa-stream icon button" onClick={ _ => this.changeTrackDisplay('artists/tracks') } title="Tracks for each artist" ></i>
                    </div>
                </div>
                <div class="delimiter"></div>
                <div id="tracks">
                    <TrackList />
                </div>
                <div class="button icon floating" onClick={ _ => displayScreen('track/add') }><i class="fa fa-plus icon"></i></div>
            </div>
        );
    }
}