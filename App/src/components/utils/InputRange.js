import React, { Component } from "react";

import MediaManager from "../../utils/MediaManager";

export default class InputRange extends Component {

    constructor(props, name, element, track, multiRange = false) {
        super(props);

        this.state = {
            track: this.props.track,
            min: this.props.track ? this.props.track.startTime : this.props.min,
            max: this.props.track ? this.props.track.endTime : this.props.max
        };

        this.startTracker = React.createRef();
        this.tracker = React.createRef();
        this.trackBar = React.createRef();

        global.actionManager.expose("setTrack", this, this.setTrack);
    }

    getPercentage(id, value) {
        return (value / this.state.track.duration) * 100;
    }

    setTrack(track) {
        this.setState({
            track: track,
            min: this.props.multiRange ? 0 : track.startTime,
            max: this.props.multiRange ? track.duration : track.endTime
        }, _ => {
            if (this.props.asReader) {
                this.asReader();
            }
        });

        this.trackBarStyle = {
            left: `${this.props.multiRange ? this.state.track.startTime * 100 / this.state.track.duration : 0}%`,
            right: `${this.props.multiRange ? 100 *  (1 - this.state.track.endTime / this.state.track.duration) : 100 }%`
        };
    }

    asReader() {
        let player = document.getElementById("player");

        this.tracker.current.oninput = event => {
            player.currentTime = event.target.value;
            let fraction = (player.currentTime - this.state.min) / (this.state.max - this.state.min);
            this.trackBar.current.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }
        setInterval(_ => {
            this.tracker.current.value = player.currentTime;
            let fraction = (player.currentTime - this.state.min) / (this.state.max - this.state.min);
            this.trackBar.current.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }, 200);

        return this;
    }

    modifyTrackStart(value) {
        mediaManager.playExtract(this.state.track, value);
        this.startTracker.current.style.left = `${this.getPercentage(value)}%`;
        this.state.track.startTime = parseInt(value);
    }

    modifyTrackEnd(value) {
        mediaManager.playExtract(this.state.track, value);
        this.trackBar.current.style.right = `${100 - this.getPercentage(value)}%`;
        this.state.track.endTime = Math.max(0, parseInt(value) + (MediaManager.EXTRACT_DURATION / 1000));
    }

    render() {
        if (!this.state.track) {
            return null;
        }

        let secondRange = this.props.multiRange ?
                (<input ref={this.startTracker} class="rangeDeactivate" type='range' min="0" max={ this.state.track.duration }
                       defaultValue={ this.state.track.startTime } step="0.5"
                       onInput={ e => this.modifyTrackStart(e.target.value) } />)
            :
                null;

        return (
            <div id="tracker" class="multi-range" >
                <div class="trackSlider" style={{ left: "0%", right: "0%" }} ></div>
                { secondRange }
                <input ref={this.tracker} class={ `mainRange ${this.props.multiRange ? "rangeDeactivate" : ""}` } type='range'
                       min={ this.state.min } max={ this.state.max } defaultValue={ this.state.track.endTime } step="0.5"
                       onInput={ e => this.props.multiRange ? this.modifyTrackEnd(e.target.value) : false } />
                <div ref={this.trackBar} class="trackBar" style={this.trackBarStyle} ></div>
            </div>
        );
    }
}

InputRange.defaultProps = {
    min: 0,
    max: 100
};
