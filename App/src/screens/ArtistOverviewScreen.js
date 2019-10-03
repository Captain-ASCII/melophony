import React, { Component } from "react";

export default class ArtistOverviewScreen extends Component {

    constructor(props) {
        super(props);

        this.artist = dataStorage.get("artists")[this.props.match.params.id];
        this.tracks = dataStorage.getAsArray("tracks").filter(track => track.artist == this.props.match.params.id);
    }

    render() {
        return (
            <div id="artistScreen">
                <div class="button icon floating top transparent" onclick="back()"><i class="fa fa-chevron-left icon"></i></div>
                <div id="artistScreenHeader">
                    <h2>{ this.artist.name }</h2>
                </div>
                <div id="artistTracks">
                    { this.tracks }
                </div>
            </div>
        );
    }
}