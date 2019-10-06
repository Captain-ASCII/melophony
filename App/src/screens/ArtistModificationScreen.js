import React, { Component } from "react";

import AbstractModificationScreen from "./AbstractModificationScreen";

export default class ArtistModificationScreen extends AbstractModificationScreen {

    constructor(props) {
        super(props);

        this.artistsNames = dataStorage.getAsArray("artists").map(artist => <option data-value={ artist.id } value={ artist.name } />);
        this.data = dataStorage.get("artists")[this.props.match.params.id] || { id: "", name: "" };

        this.type = "artist";
        this.title = this.data.name;

        this.nameInput = React.createRef();
    }

    save() {
        let sameNameArtist = dataStorage.getAsArray("artists").find(artist => artist.name === this.nameInput.current.value);
        if (sameNameArtist && (sameNameArtist.name !== this.data.name)) {
            actionManager.do("ConfirmOverlay", "",
                `Cela va effacer l'artiste "${this.data.name}" et affecter toutes ses musiques à l'artiste "${sameNameArtist.name}", êtes vous sûr ?`,
                _ => {
                    let tracks = dataStorage.getAsArray("tracks").filter(track => track.artist == this.props.match.params.id);
                    tracks.forEach(track => {
                        track.artist = sameNameArtist.id;
                        apiManager.put(`track/${track.id}`, track);
                    });
                    apiManager.delete(`artist/${this.data.id}`);
                }
            );
        } else if (!sameNameArtist) {
            super.save();
        }
    }

    renderForm() {
        return (
            <div>
                <div class="input">
                    <i class="fa fa-male fa-2x icon"></i>
                    <input ref={this.nameInput} type="text" list="artistNames" class="form-data" id="name"
                           keepvalue="true" autoComplete="off" defaultValue={ this.data.name } />
                    <datalist id="artistNames">{ this.artistsNames }</datalist>
                </div>
                <div class="input">
                    <i class="fa fa-fingerprint fa-2x icon"></i>
                    <input type="text" disabled defaultValue={ this.data.id } />
                </div>
            </div>
        );
    }
}