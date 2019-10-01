import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class TrackList extends Component {

    render() {
        return global.dataStorage.getAsArray("tracks").map((track, index) => {
            return (
                <div class="trackListItem" key={ track.id } >
                    <div onClick={ _ => global.mediaManager.startPlay(track.id, index) }>
                        <p class="title {{status}}" >{ track.title }</p>
                        <div id="{{videoId}}Progress" class="progressBar">
                            <div></div> <p></p>
                        </div>
                        <p class="duration" >{ track.duration }</p>
                    </div>
                    <Link to={`track/modify/${ track.id }`} ><i class="fa fa-pen icon button"></i></Link>
                </div>
            );
        });
    }
}