const Express = require('express')
const fs = require('fs')
const https = require('https')
const path = require('path')

const PORT = 443

const app = Express()

app.use(function(request, _, next) {
  console.log('Received new request', request.protocol, request.get('host'), request.originalUrl)
  next()
})

app.use('/public', Express.static('public'))

app.get('/*', function (_, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'), function (err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/melophony-api.ddns.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/melophony-api.ddns.net/cert.pem'),
}, app).listen(PORT, function() {
  console.log(`Production app started, (PORT: ${PORT})`)
})
