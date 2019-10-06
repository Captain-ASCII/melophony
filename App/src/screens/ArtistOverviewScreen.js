import React, { Component } from "react";
import { Link } from "react-router-dom";

import CloseButton from "../components/utils/CloseButton";
import TrackList from "../components/tracks/TrackList";

export default class ArtistOverviewScreen extends Component {

    constructor(props) {
        super(props);

        this.artist = dataStorage.get("artists")[this.props.match.params.id] || { name: "" };
        this.tracks = dataStorage.getAsArray("tracks").filter(track => track.artist == this.props.match.params.id);
    }

    render() {
        return (
            <div id="artistOverviewScreen">
                <CloseButton icon="chevron-left" additionalClass="floating mini top transparent" />
                <div id="artistScreenHeader">
                    <h1>{ this.artist.name }</h1>
                </div>

                <div id="contentHeader">
                    <h2>Titres</h2>
                    <div class="displayActions">
                        <Link to={`/artist/modify/${this.artist.id}`}><i class="fa fa-edit icon button" title="Edit artist data" ></i></Link>
                    </div>
                </div>
                <div class="delimiter"></div>

                <div id="itemList">
                    <TrackList tracks={ this.tracks } displayType="itemList" filter="" />
                </div>
            </div>
        );
    }
}