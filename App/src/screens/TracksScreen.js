import React, { Component } from "react";

import { Link } from "react-router-dom";

import Arrays from "../utils/Arrays";

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
            tracks: this._sort(
                global.dataStorage.getAsArray("tracks"),
                configurationManager.get("sortOrder"),
                configurationManager.get("sortType")
            )
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

    _sort(providedTracks, sortOrder, type) {
        let sortFct = (a, b) => -1;

        switch (type) {
            case "date":
                sortFct = (a, b) => new Date(a.creationDate) - new Date(b.creationDate);
                break
            case "title":
                sortFct = (a, b) => a.title.localeCompare(b.title);
                break
        }

        let tracks = Arrays.copy(providedTracks);
        tracks.sort((a, b) => sortFct(a, b));

        if (sortOrder == "ASC") {
            tracks.reverse();
        }

        dataStorage.set("sortedTracks", tracks);

        return tracks;
    }

    sort(type) {
        this.setState({ sortType: type, tracks: this._sort(this.state.tracks, this.state.sortOrder, type) });
    }

    switchOrder(value) {
        this.state.tracks.reverse();
        this.setState({ sortOrder: value });
    }

    componentDidMount() {
        if (window.innerWidth <= 768) {
            this.prevScrollpos = document.getElementById("itemList").scrollTop;

            document.getElementById("itemList").onscroll = function() {
                this.currentScrollPos = document.getElementById("itemList").scrollTop;
                if (this.prevScrollpos > this.currentScrollPos) {
                    document.getElementById("contentHeader").style.top = "0";
                } else {
                    document.getElementById("contentHeader").style.top = "-200px";
                }
                this.prevScrollpos = this.currentScrollPos;
            }
        }
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
                        <div class="displayActions">
                            <Switch icon="random" title="Switch track playing mode" active={configurationManager.get("shuffleMode")} configurationSwitch="shuffleMode" />
                            <i class="fa fa-list icon button" onClick={ _ => this.changeTrackDisplay("itemList") } title="Track list" ></i>
                            <i class="fa fa-th icon button" onClick={ _ => this.changeTrackDisplay("itemBlocks") } title="Track blocks" ></i>
                            <i class="fa fa-stream icon button" onClick={ _ => this.changeTrackDisplay("groupedItems") } title="Tracks for each artist" ></i>
                        </div>
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