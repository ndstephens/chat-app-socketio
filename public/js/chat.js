const socket = io()

const form = document.querySelector('#chat-form')
const input = document.querySelector('[name=message]')

socket.on('message', msg => {
  console.log(msg)
})

form.addEventListener('submit', e => {
  e.preventDefault()

  const msg = input.value
  input.value = ''
  socket.emit('sendMessage', msg)
})
