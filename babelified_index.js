"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ytdlCore = _interopRequireDefault(require("ytdl-core"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var App = (0, _express["default"])();
var PORT = 1789;
var DATA_FILE = "data.json";
var FILE_FOLDER = "files";
var State = {
  UNAVAILABLE: "unavailable",
  DOWNLOADING: "downloading",
  AVAILABLE: "available",
  DELETED: "deleted"
};
var files = {};

try {
  files = JSON.parse(_fs["default"].readFileSync(DATA_FILE, "utf8"));
} catch (exception) {
  console.warn("Unable to get previous data, restarting from zero");
}

function deleteFile(id) {
  if (_fs["default"].existsSync("".concat(FILE_FOLDER, "/").concat(id, ".m4a"))) {
    _fs["default"].unlinkSync("".concat(FILE_FOLDER, "/").concat(id, ".m4a"));
  }
}

function save() {
  _fs["default"].writeFile(DATA_FILE, JSON.stringify(files), "utf8", function (_) {
    return false;
  });
}

App.put('/:videoId', function (request, response) {
  if (!files[request.params.videoId]) {
    files[request.params.videoId] = {
      id: request.params.videoId,
      size: 1,
      state: State.UNAVAILABLE
    };
    response.send({
      added: request.params.videoId
    });
    save();
    console.log("Add ".concat(request.params.videoId, " to files"));

    _ytdlCore["default"].getInfo("https://www.youtube.com/watch?v=".concat(request.params.videoId), {}, function (error, info) {
      if (error) {
        response.send("Error: ".concat(error));
      }

      for (var i in info.formats) {
        if (info.formats[i].container == "m4a") {
          var format = info.formats[i];
          console.log("Found information for ".concat(request.params.videoId, ": [ itag: ").concat(format.itag, ", length: ").concat(format.clen, " ]"));
          files[request.params.videoId].size = format.clen;
          files[request.params.videoId].state = State.DOWNLOADING;
          save();
          (0, _child_process.exec)("ytdl -q ".concat(format.itag, " https://www.youtube.com/watch?v=").concat(request.params.videoId, " > ").concat(FILE_FOLDER, "/").concat(request.params.videoId, ".m4a"), function (error, stdout, stderr) {
            if (error) {
              response.send("Error: ".concat(error));
            }

            files[request.params.videoId].state = State.AVAILABLE;
            save();
            console.log("Download done for ".concat(request.params.videoId));
            setTimeout(function (_) {
              return deleteFile(request.params.videoId);
            }, 300000);
          });
        }
      }
    });
  } else {
    response.send({
      added: request.params.videoId
    });
  }
});
App.get("/state/:videoId", function (request, response) {
  var progress = -1;

  if (files[request.params.videoId]) {
    if (_fs["default"].existsSync("".concat(FILE_FOLDER, "/").concat(request.params.videoId, ".m4a"))) {
      var fileSize = _fs["default"].statSync("".concat(FILE_FOLDER, "/").concat(request.params.videoId, ".m4a")).size;

      progress = fileSize / files[request.params.videoId].size;
    }

    response.send({
      id: files[request.params.videoId].id,
      state: files[request.params.videoId].state,
      progress: Math.round(progress * 100)
    });
  } else {
    response.send({
      error: "id not found"
    });
  }
});
App.get("/status/:videoId", function (request, response) {
  response.send({
    state: !files[request.params.videoId] || files[request.params.videoId].state != State.AVAILABLE ? State.UNAVAILABLE : State.AVAILABLE
  });
});
App.use("/get/:videoId", function (request, response) {
  response.sendFile(_path["default"].join(__dirname, FILE_FOLDER, "".concat(request.params.videoId, ".m4a")));
});
App["delete"]("/:videoId", function (request, response) {
  deleteFile(request.params.videoId);
  files[request.params.videoId].state = State.DELETED;
  save();
  response.send({
    state: "deleted"
  });
});
App.get("/list/current", function (request, response) {
  response.send(_fs["default"].readdirSync(FILE_FOLDER));
});
App.get("/manifest", function (request, response) {
  response.send(JSON.parse(_fs["default"].readFileSync(DATA_FILE, "utf8")));
});
App.get("/migrate", function (request, response) {
  (0, _child_process.exec)("mkdir ".concat(FILE_FOLDER), function (error, stdout, stderr) {
    if (error) {
      response.send("Error: ".concat(error));
    }

    var filesAtRoot = _fs["default"].readdirSync(FILE_FOLDER);

    response.send({
      done: true,
      files: filesAtRoot
    });
  });
});
App.get("/.*", function (request, response) {
  response.send("Fallback");
});
App.listen(process.env.PORT || PORT, function () {
  console.log("Example app listening on port ".concat(process.env.PORT || PORT));
});

