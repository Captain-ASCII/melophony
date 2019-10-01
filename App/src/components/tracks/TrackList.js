import React, { Component } from "react";

export default class TrackList extends Component {

    test() {
        return [
            {"id":"3qzKo51V","title":"Ça ira, ça ira","artist":"0MIDU7cv","album":"Unknown","imageSrc":{"uri":"https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg"},"imageExtension":"jpg","creationDate":"2019-07-13T21:07:06.885Z","status":"Available","duration":214,"startTime":0,"endTime":214,"lastPlay":"","playCount":0,"rating":0,"progress":0,"videoId":"N831j0zt0jE"},
            {"id":"b7NSfwpY","title":"Hot Hands","artist":"bglHPYWF","album":"Unknown","imageSrc":{"uri":"https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg"},"imageExtension":"jpg","creationDate":"2019-07-13T21:07:06.885Z","status":"Available","duration":254,"startTime":0,"endTime":254,"lastPlay":"","playCount":0,"rating":0,"progress":0,"videoId":"qZvQiOxddT8"},
            {"id":"UTpS9Va4","title":"It Runs Through Me","artist":"GPjxprv3","album":"Unknown","imageSrc":{"uri":"https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg"},"imageExtension":"jpg","creationDate":"2019-07-13T21:07:06.885Z","status":"Available","duration":299,"startTime":30,"endTime":299,"lastPlay":"","playCount":0,"rating":0,"progress":0,"videoId":"M1N_wbhAfQ4"}
        ];
    }

    modifyTrack() {
        
    }

    render() {
        return this.test().map((track, index) => {
            return (
                <div class="trackListItem" key={ track.id } >
                    <div onClick={ _ => global.mediaManager.startPlay(track.id, index) }>
                        <p class="title {{status}}" >{ track.title }</p>
                        <div id="{{videoId}}Progress" class="progressBar">
                            <div></div> <p></p>
                        </div>
                        <p class="duration" >{ track.duration }</p>
                    </div>
                    <i onClick={ _ => this.modifyTrack(track.id) } class="fa fa-pen icon button"></i>
                </div>
            );
        });
    }
}