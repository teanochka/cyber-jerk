export default eventHandler(async (event) => {
  const { name, email, password } = await readBody(event)

  const existing = await findUserByEmail(email)
  if (existing) {
    throw createError({
      statusCode: 409,
      data: { field: 'email', message: 'Этот email уже зарегистрирован' },
    })
  }

  await createUser({
    name,
    email,
    password: await hashPassword(password),
  })

  await setUserSession(event, {
    user: {
      name,
      email,
    },
  })

  return { message: 'Successfully registered!' }
})
