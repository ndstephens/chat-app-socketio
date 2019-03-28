const socket = io()

//
//*--------------------------------------------------/
//*         CACHE UI ELEMENTS
//*--------------------------------------------------/
const formEl = document.querySelector('#chat-form')
const inputEl = document.querySelector('[name=message]')
const locationBtnEl = document.querySelector('#send-location')

//
//*--------------------------------------------------/
//*         LISTEN FOR MESSAGES -- message
//*--------------------------------------------------/
socket.on('message', msg => {
  console.log(msg)
})

//
//*--------------------------------------------------/
//*         MESSAGE FORM -- sendMessage
//*--------------------------------------------------/
formEl.addEventListener('submit', e => {
  e.preventDefault()
  const msg = inputEl.value.trim()

  if (!msg) {
    inputEl.focus()
    return
  }

  // Send message on 'sendMessage' channel
  socket.emit('sendMessage', msg, acknowledgement => {
    inputEl.value = ''
    inputEl.focus()
    console.log(acknowledgement)
    //? this optional callback is to be triggered when/if the recipient sends an acknowledgment after receiving the message
  })
})

//
//*--------------------------------------------------/
//*         LOCATION BUTTON -- sendLocation
//*--------------------------------------------------/
locationBtnEl.addEventListener('click', e => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  locationBtnEl.setAttribute('disabled', 'disabled')
  locationBtnEl.textContent = 'Fetching location...'

  navigator.geolocation.getCurrentPosition(position => {
    locationBtnEl.removeAttribute('disabled')
    locationBtnEl.textContent = 'Send Location'

    const { latitude: lat, longitude: long } = position.coords
    // Send message on 'sendLocation' channel
    socket.emit('sendLocation', { lat, long }, () => {
      console.log('Location was shared')
    })
  })
})
