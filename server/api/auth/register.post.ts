export default eventHandler(async (event) => {
  const { name, email, password } = await readBody(event)
  await createUser({
    name,
    email,
    password: await hashPassword(password),
  })

  await setUserSession(event, {
    user: {
      name: name,
      email: email,
    }
  })

  return {
    message: 'Successfully registered!',
  }
})
