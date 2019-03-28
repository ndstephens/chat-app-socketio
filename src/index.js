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
  // Send message off only to new connection (on the 'message' channel)
  socket.emit('message', generateMessage('Welcome!'))
  // Send message to everyone EXCEPT the connection that triggered it
  socket.broadcast.emit('message', generateMessage('A new user has joined'))

  //? Listen for events emitted on 'sendMessage' channel
  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter()
    // First check message for profanity
    if (filter.isProfane(msg)) {
      // use 'acknowledgements' for sending a message back to the sender
      return cb('Profanity is not allowed')
    }

    // Send message to everyone, including person who triggered it
    io.emit('message', generateMessage(msg))
    // Triggers an acknowledgement that the message was received
    cb('Delivered')
  })

  //? Listen for events emitted on 'sendLocation' channel
  socket.on('sendLocation', (loc, cb) => {
    const locationLink = `<a href="https://google.com/maps?q=${loc.lat},${
      loc.long
    }" target="_blank">My current location</a>`

    // Send message to everyone, including person who triggered it
    io.emit('message', generateMessage(locationLink))
    cb()
  })

  //? Listen for disconnect events
  socket.on('disconnect', () => {
    // Send message to everyone, including person who triggered it
    io.emit('message', generateMessage('A user has left'))
  })
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
server.listen(port, () => console.log(`Server up on port ${port}...`))
