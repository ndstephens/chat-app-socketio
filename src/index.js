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
//*         SOCKET.IO
//*--------------------------------------------------/
io.on('connection', socket => {
  console.log('New WebSocket connection')

  socket.emit('message', 'Welcome!')

  socket.on('sendMessage', msg => {
    io.emit('message', msg)
  })
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
server.listen(port, () => console.log(`Server up on port ${port}...`))
