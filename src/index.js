require('dotenv').config()
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const Filter = require('bad-words')

const { generateMessage } = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users')

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

  //?--------------------------------------------------/
  //?       LISTEN -- 'join'
  //?--------------------------------------------------/
  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    })
    if (error) return cb(error)

    //? Create/join the room they selected
    socket.join(user.room)

    //* EMIT -- 'message' ONLY to new connection/client
    socket.emit(
      'message',
      generateMessage(`${user.room} room`, `Welcome ${user.username}!`)
    )

    //* EMIT -- 'message' to everyone in room EXCEPT client that triggered it
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(`${user.room} room`, `${user.username} has joined`)
      )

    cb() // Successful join
  })

  //?--------------------------------------------------/
  //?       LISTEN -- 'sendMessage'
  //?--------------------------------------------------/
  socket.on('sendMessage', (msg, cb) => {
    // First check message for profanity
    const filter = new Filter()
    if (filter.isProfane(msg)) {
      // use 'acknowledgements' for sending a message back to the sender
      return cb('Profanity is not allowed')
    }

    // get the user to find what room they're in
    const user = getUser(socket.id)

    //* EMIT -- 'message' to everyone, including client that triggered it
    io.to(user.room).emit('message', generateMessage(user.username, msg))
    // Triggers an acknowledgement that the message was received
    cb('Delivered')
  })

  //?--------------------------------------------------/
  //?       LISTEN -- 'sendLocation
  //?--------------------------------------------------/
  socket.on('sendLocation', (loc, cb) => {
    const locationLink = `<a href="https://google.com/maps?q=${loc.lat},${
      loc.long
    }" target="_blank">My current location</a>`

    const user = getUser(socket.id)

    //* EMIT -- 'message'
    io.to(user.room).emit(
      'message',
      generateMessage(user.username, locationLink)
    )
    cb()
  })

  //?--------------------------------------------------/
  //?       LISTEN -- 'disconnect'
  //?--------------------------------------------------/
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      //* EMIT -- 'message'
      io.to(user.room).emit(
        'message',
        generateMessage(`${user.room} room`, `${user.username} has left`)
      )
    }
  })
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
server.listen(port, () => console.log(`Server up on port ${port}...`))
