export default eventHandler(async (event) => {
  await clearUserSession(event)
  return {
    message: 'Successfully logged out!',
  }
})
