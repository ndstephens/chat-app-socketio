require('dotenv').config()
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const Filter = require('bad-words')

const { generateMessage } = require('./utils/messages')

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

  //? LISTEN -- 'join'
  socket.on('join', ({ username, room }) => {
    socket.join(room)

    //? EMIT -- 'message' only to new connection/client
    socket.emit('message', generateMessage(`Welcome ${username}!`))
    //? EMIT -- 'message' to everyone in room EXCEPT the client that triggered it
    socket.broadcast
      .to(room)
      .emit('message', generateMessage(`${username} has joined`))
  })

  //? LISTEN -- 'sendMessage'
  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter()
    // First check message for profanity
    if (filter.isProfane(msg)) {
      // use 'acknowledgements' for sending a message back to the sender
      return cb('Profanity is not allowed')
    }

    //? EMIT -- 'message' to everyone, including client that triggered it
    io.emit('message', generateMessage(msg))
    // Triggers an acknowledgement that the message was received
    cb('Delivered')
  })

  //? LISTEN -- 'sendLocation'
  socket.on('sendLocation', (loc, cb) => {
    const locationLink = `<a href="https://google.com/maps?q=${loc.lat},${
      loc.long
    }" target="_blank">My current location</a>`

    //? EMIT -- 'message'
    io.emit('message', generateMessage(locationLink))
    cb()
  })

  //? LISTEN -- 'disconnect'
  socket.on('disconnect', () => {
    //? EMIT -- 'message'
    io.emit('message', generateMessage('A user has left'))
  })
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
server.listen(port, () => console.log(`Server up on port ${port}...`))
