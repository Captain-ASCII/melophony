import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class TrackList extends Component {

    constructor(props) {
        super(props);

        let artists = global.dataStorage.get("artists");
        let tracks = global.dataStorage.getAsArray("tracks");

        this.tracksCopy = [...tracks];
        for (let track of this.tracksCopy) {
            if (artists[track.artist]) {
                track.artistName = artists[track.artist].name;
            }
        }
    }

    formatDuration(duration) {
        let minutes = "0" + (duration / 60);
        let seconds = "0" + (duration % 60);
        return `${minutes.substring(0, 2)} : ${seconds.substring(0, 2)}`;
    }

    render() {
        let filtered = this.tracksCopy.filter(track => `${track.artistName}${track.title}`.toUpperCase().indexOf(this.props.filter.toUpperCase()) > -1);
        return filtered.map((track, index) => {
            return (
                <div key={ track.id } >
                    <div class="itemInfo" onClick={ _ => global.mediaManager.startPlay(track.id, index) }>
                        <p class="title " >{ track.title }</p>
                        <p class="artist" >{ track.artistName }</p>
                        <div id={`${ track.videoId }Progress`} class={ this.props.displayType == "itemList" ? "progressBar" : "" } >
                            <div></div> <p></p>
                        </div>
                        <p class="duration" >{ this.formatDuration(track.duration) }</p>
                    </div>
                    <div class="itemActions">
                        <Link to={`track/modify/${ track.id }`} ><i class="fa fa-pen icon button"></i></Link>
                    </div>
                </div>
            );
        });
    }
}