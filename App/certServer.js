const Express = require('express')
const app = Express();

app.use(Express.static(__dirname, {dotfiles: 'allow'}))

app.listen(80, () => console.log('HTTP server running on port 80'))
