import { userService } from '../services/userService.js'
import type { Context } from 'hono'

function validateEmail(email: any): email is string {
  return typeof email === 'string' && email.includes('@')
}

export const userController = {
  register: async (c: Context) => {
    try {
      const body = await c.req.json()
      const { email, password } = body

      if (!validateEmail(email)) {
        return c.json({ message: 'Invalid input' }, 400)
      }

      await userService.register(email, password)
      return c.json({ ok: true, msg: 'success' }, 201)
    } catch (err: any) {
      if (err.code === 'EMAIL_EXISTS') {
        return c.json({ message: '该邮箱已注册' }, 409)
      }
      return c.json({ message: '服务器出错了' }, 500)
    }
  },

  login: async (c: Context) => {
    try {
      const { email, password } = await c.req.json()

      if (!validateEmail(email)) {
        return c.json({ message: 'Invalid input' }, 400)
      }

      const result = await userService.login(email, password)
      return c.json(result)
    } catch (err: any) {
      if (err.code === 'INVALID_CREDENTIALS') {
        return c.json({ message: '账号或密码错误' }, 401)
      }
      return c.json({ message: '服务器出错' }, 500)
    }
  },

  getAll: async (c: Context) => {
    try {
      const users = await userService.getAllUsers()
      return c.json(users)
    } catch (err) {
      return c.json({ message: '服务器出错' }, 500)
    }
  },

  getById: async (c: Context) => {
    try {
      const id = c.req.param('id')
      const user = await userService.getUserById(id)

      if (!user) return c.json({ message: 'Not found' }, 404)
      return c.json(user)
    } catch {
      return c.json({ message: '服务器出错' }, 500)
    }
  },

  update: async (c: Context) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()

      // 仅更新存在的字段
      const patch: any = {}
      if (body.email !== undefined) {
        if (!validateEmail(body.email)) {
          return c.json({ message: 'Invalid email' }, 400)
        }
        patch.email = body.email
      }
      if (body.password !== undefined) {
        patch.password = body.password
      }

      const updated = await userService.updateUser(id, patch)
      return c.json(updated)
    } catch {
      return c.json({ message: '服务器出错' }, 500)
    }
  },

  delete: async (c: Context) => {
    try {
      const id = c.req.param('id')
      await userService.deleteUser(id)
      return c.json({ ok: true })
    } catch {
      return c.json({ message: '服务器出错' }, 500)
    }
  },
}
