import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ArtistsScreen extends Component {

    test() {
        return [
            { "id": "0MIDU7cv", "name": "The Pirouettes" },
            { "id": "bglHPYWF", "name": "Darius" },
            { "id": "GPjxprv3", "name": "Tom Misch" },
            { "id": "ZgNq1AOu", "name": "Tame Impala" }
        ];
    }

    render() {
        let artists = this.test().map(artist => {
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
            <div id="artists">{ artists }</div>
        );
    }
}