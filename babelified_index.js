"use strict";

var _express = _interopRequireDefault(require("express"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var App = (0, _express["default"])();
App.get('/:videoId', function (request, response) {
  console.log(request.params.videoId);
  (0, _child_process.exec)("ytdl -i https://www.youtube.com/watch?v=".concat(request.params.videoId, " | grep m4a"), function (error, stdout, stderr) {
    if (error) {
      response.send("Error: ".concat(error));
      return;
    }

    (0, _child_process.exec)("ytdl -q 140 --print-url https://www.youtube.com/watch?v=".concat(request.params.videoId), function (error, stdout, stderr) {
      if (error) {
        response.send("Error: ".concat(error));
      }

      response.send({
        url: stdout
      });
    });
  });
});
App.get("/.*", function (request, response) {
  response.send("Fallback");
});
App.listen(8081, function () {
  console.log('Example app listening on port 3000!');
});

