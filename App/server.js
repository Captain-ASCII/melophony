const Express = require('express')
const fs = require('fs')
const https = require('https')

const PORT = 1804


const app = Express()

app.use(function(request, response, next) {
    console.log('Received new request', request.protocol, request.get('host'), request.originalUrl)
    next()
})

app.use('/', Express.static('public'))


https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/cert.pem'),
}, app).listen(PORT, function() {
    console.log('Production app started')
})
