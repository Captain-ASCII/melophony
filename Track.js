
function generateId() {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default class Track {

    constructor(title, videoId) {
        this.id = generateId();
        this.title = title;
        this.artist = "Artist";

        this.videoId = videoId;
        this.title = title;
        this.artist = "Unknown";
        this.album = "Unknown";
        this.imageSrc = { uri: `https://i.ytimg.com/vi/${this.videoId}/mqdefault.jpg` };
        this.imageExtension = "jpg";
        this.creationDate = new Date().toISOString();
        this.status = "Unavailable";
        this.duration = "PT0M0S";
        this.startTime = 0;
        this.endTime = 0;
        this.lastPlay = "";
        this.playCount = 0;
        this.rating = 0;
        this.progress = 0;
    }
}