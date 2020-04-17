
// import 'tsconfig-paths/register'
// import 'module-alias/register'
import 'reflect-metadata'

import Express from 'express'
import HTTP from 'http'
import HTTPS from 'https'
import FileSystem from 'fs'
import WebSocket from 'ws'
import Cors from 'cors'
import { createConnection } from 'typeorm'

import { AppEvents, getListenerConnector } from '@utils/AppEventUtils'

import ArtistAspect from '@api/ArtistAspect'
import AuthenticationAspect from '@api/AuthenticationAspect'
import FileAspect from '@api/FileAspect'
import LogAspect from '@api/LogAspect'
import PlaylistAspect from '@api/PlaylistAspect'
import TrackAspect from '@api/TrackAspect'
import UserAspect from '@api/UserAspect'

const PORT = 1789
const HTTPS_PORT = 1804

createConnection().then(async () => {

  const configuration = JSON.parse(FileSystem.readFileSync('configuration/configuration.json', 'utf8'))
  let credentials = {}

  if (!configuration.DEBUG) {
    const privateKey = FileSystem.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/privkey.pem', 'utf8')
    const certificate = FileSystem.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/cert.pem', 'utf8')
    const ca = FileSystem.readFileSync('/etc/letsencrypt/live/melophony.ddns.net/fullchain.pem', 'utf8')
    credentials = { key: privateKey, cert: certificate, ca: ca }
  }
  const App = Express()

  App.use(Express.text())
  App.use(Express.json())

  // App.use(function(request, response, next: Function) {
  //   response.header('Access-Control-Allow-Origin', '*')
  //   response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  //   response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  //   next()
  // })
  App.use(Cors())

  App.use('/.well-known/acme-challenge/', Express.static('.well-known/acme-challenge/', { dotfiles: 'allow' }))

  App.use(new AuthenticationAspect().getRouter())
  App.use(new LogAspect().getRouter())
  App.use(new UserAspect().getRouter())
  App.use(new TrackAspect().getRouter())
  App.use(new FileAspect().getRouter())
  App.use(new ArtistAspect().getRouter())
  App.use(new PlaylistAspect().getRouter())

  /* FALLBACK */

  App.get('/*', (request, response) => {
    response.send({ status: 'Nothing to do' })
  })

  if (configuration.DEBUG) {
    const server = HTTP.createServer(App)
    server.listen(PORT, function () {
      console.log(`HTTP: Example app listening on port ${PORT}`)
    })
  } else {
    const server = HTTPS.createServer(credentials, App)
    const wsServer = new WebSocket.Server({ server })

    wsServer.on('connection', ws => {
      getListenerConnector().on(AppEvents.DOWNLOAD_END, (id: number) => ws.send(JSON.stringify({ event: AppEvents.DOWNLOAD_END, id })))
      getListenerConnector().on(AppEvents.DOWNLOAD_PROGRESS, (id: number, value: number) => ws.send(JSON.stringify({ event:AppEvents.DOWNLOAD_PROGRESS, id, progress: value })))
    })

    // const httpServer = HTTP.createServer(function(request, response) {
    // response.redirect(`https://${request.headers.host}${request.url}`)
    // }).listen(80)

    server.listen(HTTPS_PORT, function () {
      console.log(`HTTPS: Example app listening on port ${HTTPS_PORT}`)
    })
  }
}).catch(error => console.log(error))

