import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ArtistsScreen extends Component {

    render() {
        let artists = global.dataStorage.getAsArray("artists").map(artist => {
            return (
                <div class="artistListItem" key={ artist.id } >
                    <Link to={`/artist/${artist.id}`}>
                        <div class="name">
                            <p>{ artist.name }</p>
                        </div>
                    </Link>
                    <div class="artistActions">
                        <Link to={`/artist/modify/${artist.id}`}><i class="fa fa-pen icon"></i></Link>
                    </div>
                </div>
            );
        });

        return (
            <div id="itemBlocks">{ artists }</div>
        );
    }
}