import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class TrackList extends Component {

    formatDuration(duration) {
        let minutes = "0" + Math.round(duration / 60);
        let seconds = "0" + (duration % 60);
        return `${minutes.substr(-2)} : ${seconds.substr(-2)}`;
    }

    render() {
        let artists = global.dataStorage.get("artists");

        this.tracksCopy = this.props.tracks.map(track => { return { ...track } });
        for (let track of this.tracksCopy) {
            if (artists[track.artist]) {
                track.artistName = artists[track.artist].name;
            }
        }

        let filtered = this.tracksCopy.filter(track => `${track.artistName}${track.title}`.toUpperCase().indexOf(this.props.filter.toUpperCase()) > -1);
        return filtered.map((track, index) => {
            let blockStyle = {};
            if (this.props.displayType == "itemBlocks") {
                blockStyle = { backgroundImage: `url(${track.imageSrc.uri}` };
            }
            return (
                <div class="trackListItem" style={blockStyle} key={ track.id } >
                    <div>
                        <div class="itemInfo" onClick={ _ => global.mediaManager.startPlay(track.id, index) }>
                            <p class="title " >{ track.title }</p>
                                { this.props.withArtist ?
                                    (<Link to={`/artist/${ track.artist }`} onClick={ e => e.stopPropagation() }>
                                        <p class="artist" >{ track.artistName }</p>
                                    </Link>) : null
                                }
                            <div id={`${ track.videoId }Progress`} class={ this.props.displayType == "itemList" ? "progressBar" : "" } >
                                <div></div> <p></p>
                            </div>
                            <p class="duration" >{ this.formatDuration(track.duration) }</p>
                        </div>
                        <div class="itemActions">
                            <Link to={`/track/modify/${ track.id }`} ><i class="fa fa-pen icon button"></i></Link>
                        </div>
                    </div>
                </div>
            );
        });
    }
}