//* Immediately create a connection
const socket = io()

//
//*--------------------------------------------------/
//*         CACHE UI ELEMENTS && TEMPLATES
//*--------------------------------------------------/
const formEl = document.querySelector('#message-form')
const inputEl = document.querySelector('[name=message]')
const locationBtnEl = document.querySelector('#send-location')
const messagesEl = document.querySelector('#messages')

//? TEMPLATES
// const messageTemplate = document.querySelector('#message-template').innerHTML

//
//*--------------------------------------------------/
//*         OPTIONS
//*--------------------------------------------------/
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

//
//*--------------------------------------------------/
//*         USERNAME AND ROOM -- EMIT 'join'
//*--------------------------------------------------/
socket.emit('join', { username, room })
// emitted when page loads (chat.html)

//
//*--------------------------------------------------/
//*         CHAT MESSAGES -- LISTEN 'message'
//*--------------------------------------------------/
socket.on('message', message => {
  const timeStamp = moment(message.createdAt).format('h:mm:ss a')
  // const html = Mustache.render(messageTemplate, {
  //   message,
  // })
  const html = `
  <div class="message">
    <p>
      <span class="message__name">Some User Name</span>
      <span class="message__meta">${timeStamp}</span>
    </p>
    <p>${message.text}</p>
  </div>
  `

  messagesEl.insertAdjacentHTML('beforeend', html)
})

//
//*--------------------------------------------------/
//*         MESSAGE FORM -- EMIT 'sendMessage'
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
//*         LOCATION BUTTON -- EMIT 'sendLocation'
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
