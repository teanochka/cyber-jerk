export default eventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const user = await findUserByEmail(email)
  if (!user) {
    throw createError({
      message: 'Email not found! Please register.',
      statusCode: 401,
    })
  }
  if (!user.password || !(await verifyPassword(user.password, password))) {
    throw createError({
      message: 'Incorrect password!',
      statusCode: 401,
    })
  }
  await setUserSession(event, {
    user: {
      name: user.name,
      email: user.email,
    },
  })
  return getUserSession(event)
})
