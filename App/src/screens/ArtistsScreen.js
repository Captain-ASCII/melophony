import React, { Component } from "react";
import { Link } from "react-router-dom";

import TextInput from "./../components/utils/TextInput";

export default class ArtistsScreen extends Component {

    constructor(props) {
        super(props);

        this.artists = global.dataStorage.getAsArray("artists");
        this.state = { filter: "" };
    }

    filter(text) {
        this.setState({ filter: text });
    }

    render() {
        let filtered = this.artists.filter(artist => artist.name.toUpperCase().indexOf(this.state.filter.toUpperCase()) > -1);
        let artists = filtered.map(artist => {
            return (
                <div class="artistListItem" key={ artist.id } >
                    <Link to={`/artist/${artist.id}`} class="link" >
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
            <div id="artistScreen">
                <div id="contentHeader">
                    <h1>Artistes</h1>
                    <div class="searchbar">
                        <TextInput id="trackSearch" icon="search" onInput={ text => this.filter(text) } />
                    </div>
                    <div class="displayActions">
                        {/*<Switch icon="random" title="Switch track playing mode" active={configurationManager.get("shuffleMode")} configurationSwitch="shuffleMode" />
                        <i class="fa fa-list icon button" onClick={ _ => this.changeTrackDisplay("itemList") } title="Track list" ></i>
                        <i class="fa fa-th icon button" onClick={ _ => this.changeTrackDisplay("itemBlocks") } title="Track blocks" ></i>
                        <i class="fa fa-stream icon button" onClick={ _ => this.changeTrackDisplay("groupedItems") } title="Tracks for each artist" ></i>*/}
                    </div>
                </div>
                <div class="delimiter"></div>
                <div id="itemBlocks">{ artists }</div>
            </div>
        );
    }
}