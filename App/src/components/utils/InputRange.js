import React, { Component } from "react";

export default class InputRange extends Component {

    constructor(props, name, element, track, multiRange = false) {
        super(props);

        this.state = { track: null };

        this.tracker = React.createRef();
        this.trackBar = React.createRef();

        global.actionManager.expose("setTrack", this, this.setTrack);
        console.warn(global.actionManager)
    }

    setTrack(track) {
        this.setState({ track: track });

        this.trackBarStyle = {
            left: `${this.props.multiRange ? this.state.track.startTime * 100 / this.state.track.duration : 0}%`,
            right: `${this.props.multiRange ? 100 *  (1 - this.state.track.endTime / this.state.track.duration) : 100 }%`
        };

        if (this.props.asReader) {
            setTimeout(_ => this.asReader(), 10);
        }
    }

    asReader() {
        let player = document.getElementById("player");

        this.tracker.current.oninput = event => {
            player.currentTime = event.target.value;
            let fraction = (player.currentTime - this.tracker.current.min) / (this.tracker.current.max - this.tracker.current.min);
            this.trackBar.current.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }
        setInterval(_ => {
            this.tracker.current.value = player.currentTime;
            let fraction = (player.currentTime - this.tracker.current.min) / (this.tracker.current.max - this.tracker.current.min);
            this.trackBar.current.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }, 200);

        return this;
    }

    modifyTrackStart(value) {
        mediaManager.playExtract(this.state.track, value);
        document.querySelector("#trackModificator > .trackBar").style.left = `calc(${getPercentage(id, value)}% + 10px)`;
        this.state.track.startTime = parseInt(value);
    }

    modifyTrackEnd(value) {
        mediaManager.playExtract(this.state.track, value);
        document.querySelector("#trackModificator > .trackBar").style.right = `calc(${100 - getPercentage(id, value)}% + 10px)`;
        this.state.track.endTime = Math.max(0, parseInt(value) + (EXTRACT_DURATION / 1000));
    }

    render() {
        if (!this.state.track) {
            return null;
        }

        let secondRange = this.props.multiRange ?
                (<input class="rangeDeactivate" type='range' min="0" max={ this.state.track.duration }
                       defaultValue={ this.state.track.startTime } step="0.5"
                       onInput={ _ => this.modifyTrackStart(this.value) } />)
            :
                null;

        return (
            <div id="tracker" class="multi-range" >
                <div class="trackSlider" style={{ left: "calc(0% + 10px)", right: "calc(0% + 10px)" }} ></div>
                { secondRange }
                <input ref={this.tracker} class={ `mainRange ${this.props.multiRange ? "rangeDeactivate" : ""}` }
                       type='range' min={ this.props.multiRange ? 0 : this.state.track.startTime } max={ this.props.multiRange ? this.state.track.duration : this.state.track.endTime }
                       defaultValue={ this.state.track.endTime } step="0.5" onInput={ _ => this.props.multiRange ? this.modifyTrackEnd(this.value) : false } />
                <div ref={this.trackBar} class="trackBar" style={this.trackBarStyle} ></div>
            </div>
        );
    }
}

