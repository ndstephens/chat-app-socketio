require('dotenv').config()
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

//
//*--------------------------------------------------/
//*         INIT APP
//*--------------------------------------------------/
const app = express()
// Setup SOCKET.IO
const server = http.createServer(app)
const io = socketIO(server)
// Set PORT
const port = process.env.PORT || 3000

//
//*--------------------------------------------------/
//*         MIDDLEWARE
//*--------------------------------------------------/
app.use(express.static('public'))

app.get('/', (req, res, next) => {
  res.sendFile('index.html')
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
server.listen(port, () => console.log(`Server up on port ${port}...`))
io.on('connection', () => console.log('New WebSocket connection'))
