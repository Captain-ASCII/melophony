import React, { Component } from "react";

import { Link } from "react-router-dom";

import TrackList from "../components/tracks/TrackList";
import TextInput from "../components/utils/TextInput";
import Switch from "../components/utils/Switch";
import CustomSelect from "../components/utils/Select";

export default class TracksScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filter: "",
            sortType: "date",
            sortOrder: "ASC",
            groupByArtist: false,
            displayType: configurationManager.get("displayType"),
            tracks: global.dataStorage.getAsArray("tracks")
        };

        this.sort(this.state.sortType);

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

    sort(type) {
        let sortFct = (a, b) => -1;

        switch (type) {
            case "date":
                sortFct = (a, b) => new Date(a.creationDate) - new Date(b.creationDate);
                break
            case "title":
                sortFct = (a, b) => a.title.localeCompare(b.title);
                break
        }

        let tracks = this.state.tracks.sort((a, b) => sortFct(a, b));
        if (this.state.sortOrder == "ASC") {
            tracks = tracks.reverse();
        }

        this.setState({ sortType: type, tracks: tracks });
    }

    switchOrder(enabled) {
        this.setState({ sortOrder: enabled ? "DESC" : "ASC" }, _ => this.sort(this.state.sortType));
    }

    render() {
        return (
            <div id="trackScreen" >
                <div id="contentHeader">
                    <h1>Titres</h1>
                    {/*<div class="searchbar">
                        <TextInput id="trackSearch" icon="search" onInput={ text => this.filter(text) } />
                    </div>*/}
                    <div id="sortBar" >
                        <CustomSelect onSelection={ sortType => this.sort(sortType) } >
                            <option value="title">By title</option>
                            <option value="date">By date of download</option>
                        </CustomSelect>
                        <Switch icon="arrow-alt-circle-up" icon2="arrow-alt-circle-down" doubleState
                                onSwitch={ e => this.switchOrder(e) } configurationSwitch="sortDesc" />
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
                    <TrackList tracks={ this.state.tracks } filter={ this.state.filter }
                               displayType={ this.state.displayType } withArtist />
                </div>
                <Link to={"/track/create"} ><div class="button icon floating"><i class="fa fa-plus icon"></i></div></Link>
            </div>
        );
    }
}