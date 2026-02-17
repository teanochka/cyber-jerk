export default eventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const user = await findUserByEmail(email)
  if (!user) {
    throw createError({
      statusCode: 401,
      data: { field: 'email', message: 'Пользователь с таким email не найден' },
    })
  }

  if (!user.password || !(await verifyPassword(user.password, password))) {
    throw createError({
      statusCode: 401,
      data: { field: 'password', message: 'Неверный пароль' },
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })

  return getUserSession(event)
})
