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
            sortType: configurationManager.get("sortType"),
            sortOrder: configurationManager.get("sortOrder"),
            displayType: configurationManager.get("displayType"),
            tracks: global.dataStorage.getAsArray("tracks")
        };

        this._sort(this.state.sortType);

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

    _sort(type) {
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
            tracks.reverse();
        }
        return tracks;
    }

    sort(type) {
        this.setState({ sortType: type, tracks: this._sort(type) });
    }

    switchOrder(value) {
        this.state.tracks.reverse();
        this.setState({ sortOrder: value }, _ => console.warn(this.state));
    }

    render() {
        return (
            <div id="trackScreen" >
                <div id="contentHeader">
                    <h1>Titres</h1>
                    <div id="toolBar">
                        <div class="searchbar">
                            <TextInput id="trackSearch" icon="search" onInput={ text => this.filter(text) } />
                        </div>
                        <div id="sortBar" >
                            <CustomSelect onSelection={ sortType => this.sort(sortType) } icon="" placeholder="Order" >
                                <option value="title">By title</option>
                                <option value="date">By date of download</option>
                            </CustomSelect>
                            <Switch enabledState={{ value: "ASC", icon: "sort-amount-up" }} disabledState={{ value: "DESC", icon: "sort-amount-down" }}
                                    doubleState onSwitch={ e => this.switchOrder(e) } configurationSwitch="sortOrder" />
                        </div>
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