exports.generateMessage = text => {
  return {
    text,
    createdAt: Date.now(),
  }
}
