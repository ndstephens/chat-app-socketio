const socket = io()

const form = document.querySelector('#chat-form')
const input = document.querySelector('[name=message]')
const locationBtn = document.querySelector('#send-location')

//? Listen for events emitted on 'message' channel
socket.on('message', msg => {
  console.log(msg)
})

//? Form input to send a message to everyone
form.addEventListener('submit', e => {
  e.preventDefault()

  const msg = input.value
  input.value = ''
  // Send message on 'sendMessage' channel
  socket.emit('sendMessage', msg)
})

//? Button click to send everyone your location
locationBtn.addEventListener('click', e => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude: lat, longitude: long } = position.coords
    // Send message on 'sendLocation' channel
    socket.emit('sendLocation', { lat, long })
  })
})
