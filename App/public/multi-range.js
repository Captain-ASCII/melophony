// import React, { Component } from "react";

// export default class InputRange extends Component {

//     constructor(props, name, element, track, multiRange = false) {
//         super(props);

//         global.actionManager.expose("setTrack", this.setTrack);
//         this.name = name;

//         this.trackBarStyle = {
//             left: `${this.state.multiRange ? this.track.startTime * 100 / this.track.duration : 0}%`,
//             right: `${this.state.multiRange ? 100 *  (1 - track.endTime / track.duration) : 100 }%`;
//         };

//         element.id = name;
//         element.className = "multi-range";

//         return this;
//     }

//     setTrack(track) {
//         this.track = track;
//     }

//     // asReader(player) {
//     //     let tracker = document.querySelector(`#${this.name} > .mainRange`);
//     //     let trackBar = document.querySelector(`#${this.name} > .trackBar`);

//     //     tracker.oninput = function (event) {
//     //         player.currentTime = event.target.value;
//     //         let fraction = (player.currentTime - tracker.min) / (tracker.max - tracker.min);
//     //         trackBar.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
//     //     }
//     //     setInterval(_ => {
//     //         tracker.value = player.currentTime;
//     //         let fraction = (player.currentTime - tracker.min) / (tracker.max - tracker.min);
//     //         trackBar.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
//     //     }, 200);

//     //     return this;
//     // }

//     render() {
//         return (
//             <div class="trackSlider" style={{ left: "calc(0% + 10px)", right: "calc(0% + 10px)" }} ></div>
//             {
//                 this.state.multiRange ?
//                     <input class="rangeDeactivate" type='range' min="0" max={ this.track.duration }
//                            defaultValue={ this.track.startTime } step="0.5"
//                            onInput={ _ => this.modifyTrackStart(this.track.id, this.value); } />
//                 :
//                     null
//             }
//             <input class={ `mainRange ${multiRange ? "rangeDeactivate" : ""}` }
//                    type='range' min={ multiRange ? 0 : track.startTime } max={ multiRange ? track.duration : track.endTime }
//                    defaultValue={ track.endTime } step="0.5" onInput={ _ => this.modifyTrackEnd(this.track.id, this.value); } />
//             <div class="trackBar" style={this.trackBarStyle} ></div>
//         );
//     }
// }

