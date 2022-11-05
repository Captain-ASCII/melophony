const Express = require('express')
const fs = require('fs')
const https = require('https')
const path = require('path')
const expressStaticGzip = require('express-static-gzip')

const PORT = 443

const app = Express()

app.use(function(request, _, next) {
  console.log('Received new request', request.protocol, request.get('host'), request.originalUrl)
  next()
})

app.use('/public', expressStaticGzip(path.join(__dirname, 'public'), {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: function (res, path) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }
}))

app.get('/*', function (_, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'), function (err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/cert.pem'),
}, app).listen(PORT, function() {
  console.log(`Production app started, (PORT: ${PORT})`)
})
