import { userService } from '../services/userService.js'

export const userController = {
  register: async (c: any) => {
    const body = await c.req.json()
    const { email, password } = body

    try {
      await userService.register(email, password)
      return c.json({ ok: true, msg: 'success' }, 201)
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS')
        return c.json({ error: 'Email exists' }, 409)
      console.log(err)
      return c.json({ error: 'Server error' }, 500)
    }
  },

  login: async (c: any) => {
    const { email, password } = await c.req.json()
    try {
      const result = await userService.login(email, password)
      return c.json(result)
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS')
        return c.json({ error: 'Invalid credentials' }, 401)
      return c.json({ error: 'Server error' }, 500)
    }
  },

  getAll: async (c: any) => {
    const users = await userService.getAllUsers()
    return c.json(users)
  },

  getById: async (c: any) => {
    const { id } = c.req.param()
    const user = await userService.getUserById(id)
    if (!user) return c.json({ error: 'Not found' }, 404)
    return c.json(user)
  },

  update: async (c: any) => {
    const { id } = c.req.param()
    const { email, password } = await c.req.json()
    const user = await userService.updateUser(id, email, password)
    return c.json(user)
  },

  delete: async (c: any) => {
    const { id } = c.req.param()
    await userService.deleteUser(id)
    return c.json({ ok: true })
  },
}
