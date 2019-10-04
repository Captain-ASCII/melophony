import React, { Component } from "react";

import { Link } from "react-router-dom";

import TrackList from "./../components/tracks/TrackList";
import TextInput from "./../components/utils/TextInput";
import Switch from "./../components/utils/Switch";

export default class TracksScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filter: "",
            groupByArtist: false,
            displayType: configurationManager.get("displayType")
        };

        this.shuffleButton = React.createRef();
    }

    switchTrackMode() {
        configurationManager.set("shuffleMode", !configurationManager.get("shuffleMode"));
    }

    changeTrackDisplay(type) {
        this.setState({ displayType: type });
        configurationManager.set("displayType", type);
    }

    filter(value) {
        this.setState({ filter: value });
    }

    render() {
        return (
            <div>
                <div id="contentHeader">
                    <h1>Titres</h1>
                    <div class="searchbar">
                        <TextInput id="trackSearch" icon="search" onInput={ text => this.filter(text) } />
                    </div>
                    <div class="displayActions">
                        <Switch icon="random" title="Switch track playing mode" active={configurationManager.get("shuffleMode")} configurationSwitch="shuffleMode" />
                        <i class="fa fa-list icon button" onClick={ _ => this.changeTrackDisplay("itemList") } title="Track list" ></i>
                        <i class="fa fa-th icon button" onClick={ _ => this.changeTrackDisplay("itemBlocks") } title="Track blocks" ></i>
                        <i class="fa fa-stream icon button" onClick={ _ => this.changeTrackDisplay("groupedItems") } title="Tracks for each artist" ></i>
                    </div>
                </div>
                <div class="delimiter"></div>
                <div id={this.state.displayType}>
                    <TrackList filter={ this.state.filter } displayType={ this.state.displayType } />
                </div>
                <Link to={"/track/create"} ><div class="button icon floating"><i class="fa fa-plus icon"></i></div></Link>
            </div>
        );
    }
}