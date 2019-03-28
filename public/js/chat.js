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
const sidebarEl = document.querySelector('#sidebar')

//
//*--------------------------------------------------/
//*         OPTIONS -- parse URL query
//*--------------------------------------------------/
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

//
//*--------------------------------------------------/
//*         USERNAME AND ROOM -- EMIT 'join'
//*--------------------------------------------------/
// emitted when page loads (chat.html)
socket.emit('join', { username, room }, err => {
  if (err) {
    alert(err)
    location.href = '/'
  }
})

//
//*--------------------------------------------------/
//*         CHAT MESSAGES -- LISTEN 'message'
//*--------------------------------------------------/
socket.on('message', message => {
  const timeStamp = moment(message.createdAt).format('h:mm:ss a')

  const html = `
  <div class="message">
    <p>
      <span class="message__name">${message.username}</span>
      <span class="message__meta">${timeStamp}</span>
    </p>
    <p>${message.msg}</p>
  </div>
  `

  messagesEl.insertAdjacentHTML('beforeend', html)
})

//
//*--------------------------------------------------/
//*         ROOM DATA -- LISTEN 'roomData'
//*--------------------------------------------------/
socket.on('roomData', ({ room, users }) => {
  const html = `
  <h2 class="room-title">${room}</h2>
  <h3 class="list-title">Users</h3>
  <ul class="users">
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  </ul>
  `

  sidebarEl.innerHTML = html
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
    inputEl.focus()

    const { latitude: lat, longitude: long } = position.coords
    // Send message on 'sendLocation' channel
    socket.emit('sendLocation', { lat, long }, () => {
      console.log('Location was shared')
    })
  })
})
