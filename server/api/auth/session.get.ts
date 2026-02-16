export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  return session
})
