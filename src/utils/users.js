const users = []

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    }
  }

  // Verify username is unique
  const existingUser = users.some(user => {
    return user.username === username && user.room === room
  })
  if (existingUser) {
    return {
      error: 'Username is already in use',
    }
  }

  // Store the user
  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)
  if (index === -1) {
    return {
      error: 'User not found',
    }
  }
  return users.splice(index, 1)[0]
}

const getUser = id => {
  return users.find(user => user.id === id)
}

const getUsersInRoom = room => {
  return users.filter(user => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
}
