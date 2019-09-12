
class InputRange {

    constructor(name, element, track, multiRange = false) {
        this.name = name;

           // <div class="trackSlider" style="left: calc(0% + 10px); right: calc(0% + 10px);" ></div>
        let content = `<div class="trackSlider" style="left: calc(0% + 10px); right: calc(0% + 10px);" ></div>`;

        if (multiRange) {
            content += `<input class="rangeDeactivate" type='range' min="0" max="${track.duration}" value="${track.startTime}" step="0.5" oninput="modifyTrackStart('${track.id}', this.value);" />`;
        }

        content += `
            <input class="mainRange ${multiRange ? "rangeDeactivate" : ""}" type='range' min="${multiRange ? 0 : track.startTime}" max="${multiRange ? track.duration : track.endTime}" value="${track.endTime}" step="0.5" oninput="modifyTrackEnd('${track.id}', this.value);" />
            <div class="trackBar" style="left: calc(${multiRange ? track.startTime*100/track.duration : 0}%); right: ${multiRange ? 100 *  (1 - track.endTime / track.duration) : "100"}%;" ></div>
        `;

        element.innerHTML = content;
        element.id = name;
        element.className = "multi-range";

        return this;
    }

    asReader(player) {
        let tracker = document.querySelector(`#${this.name} > .mainRange`);
        let trackBar = document.querySelector(`#${this.name} > .trackBar`);

        tracker.oninput = function (event) {
            player.currentTime = event.target.value;
            let fraction = (player.currentTime - tracker.min) / (tracker.max - tracker.min);
            trackBar.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }
        setInterval(_ => {
            tracker.value = player.currentTime;
            let fraction = (player.currentTime - tracker.min) / (tracker.max - tracker.min);
            trackBar.style.right = `calc(${100 * (1 - fraction)}% - ${(fraction * -12) + 6}px)`;
        }, 200);

        return this;
    }
}

