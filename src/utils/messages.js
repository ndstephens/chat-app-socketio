exports.generateMessage = (username, msg) => {
  return {
    username,
    msg,
    createdAt: Date.now(),
  }
}
