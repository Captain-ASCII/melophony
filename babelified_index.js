"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var App = (0, _express["default"])();
var PORT = 1789;
var FILE = "file.m4a";
App.use("/get", _express["default"]["static"](FILE));
App.get("/clear", function (request, response) {
  _fs["default"].unlinkSync(FILE);

  response.send({
    state: "deleted"
  });
});
App.get('/:videoId', function (request, response) {
  console.log(request.params.videoId);
  (0, _child_process.exec)("ytdl -i https://www.youtube.com/watch?v=".concat(request.params.videoId, " | grep m4a"), function (error, stdout, stderr) {
    if (error || typeof stdout != "string") {
      response.send("Error: ".concat(error));
      return;
    }

    var quality = stdout.match(/[0-9]+/);
    console.warn(quality);
    (0, _child_process.exec)("ytdl -q ".concat(quality[0], " https://www.youtube.com/watch?v=").concat(request.params.videoId, " > ").concat(FILE), function (error, stdout, stderr) {
      if (error) {
        response.send("Error: ".concat(error));
      }

      response.send({
        done: true
      });
    });
  });
});
App.get("/.*", function (request, response) {
  response.send("Fallback");
});
App.listen(process.env.PORT || PORT, function () {
  console.log("Example app listening on port ".concat(process.env.PORT || PORT));
});

