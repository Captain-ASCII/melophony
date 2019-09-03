
class InputRange {

    constructor(name, element, track, multiRange = false) {
        this.name = name;

        let content = `
            <div class="trackSlider" style="left: calc(0% + 10px); right: calc(0% + 10px);" ></div>
            <div class="trackBar" style="left: calc(${multiRange ? track.startTime*100/track.duration : "0"}% + 10px); right: ${multiRange ? (track.endTime / track.duration) : "100"}%;" ></div>
            <input class="mainRange" type='range' min="0" max="${track.duration}" value="${track.startTime}" step="0.5" oninput="modifyTrackStart('${track.id}', this.value);" />
        `;

        if (multiRange) {
            content += `<input type='range' min="0" max="${track.duration}" value="${track.duration - track.endTime}" step="0.5" oninput="modifyTrackEnd('${track.id}', this.value);" />`;
        }

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
            trackBar.style.right = `calc(${100 - (player.currentTime*100/tracker.max)}% - 10px)`;
        }
        setInterval(_ => {
            tracker.value = player.currentTime;
            trackBar.style.right = `calc(${100 - (player.currentTime*100/tracker.max)}% - 10px)`;
        }, 200);

        return this;
    }
}

