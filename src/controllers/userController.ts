import { userService } from '../services/userService.js'
import type { Context } from 'hono'
import { successResponse, errorResponse } from '../utils/response.js'

function validateEmail(email: any): email is string {
  return typeof email === 'string' && email.includes('@')
}

export const userController = {
  register: async (c: Context) => {
    try {
      const body = await c.req.json()
      const { email, password } = body

      // 1. 输入校验
      if (!validateEmail(email) || !password || password.length < 8) {
        return errorResponse(
          c,
          '邮箱格式错误或密码长度不足（至少8位）',
          'INVALID_INPUT',
          400
        )
      }

      await userService.register(email, password)

      return successResponse(c, null, '注册成功，请登录', 201)
    } catch (err: any) {
      if (err.code === 'EMAIL_EXISTS') {
        return errorResponse(
          c,
          '该邮箱已被注册，请直接登录',
          'EMAIL_EXISTS',
          409
        )
      }
      if (err.code === 'WEAK_PASSWORD') {
        return errorResponse(
          c,
          '密码过于简单，请设置强密码',
          'WEAK_PASSWORD',
          400
        )
      }

      console.error('Register Error:', err)
      return errorResponse(c, '服务器内部错误，请稍后再试', 'SERVER_ERROR', 500)
    }
  },

  login: async (c: Context) => {
    try {
      const { email, password } = await c.req.json()

      if (!email || !password) {
        return errorResponse(c, '请输入账号和密码', 'INVALID_INPUT', 400)
      }

      const result = await userService.login(email, password)

      return successResponse(c, result, '登录成功')
    } catch (err: any) {
      if (err.code === 'INVALID_CREDENTIALS') {
        return errorResponse(c, '账号或密码错误', 'INVALID_CREDENTIALS', 401)
      }

      console.error('Login Error:', err)
      return errorResponse(c, '登录服务暂时不可用', 'SERVER_ERROR', 500)
    }
  },

  getAll: async (c: Context) => {
    try {
      const users = await userService.getAllUsers()
      return successResponse(c, users)
    } catch (err) {
      console.error('GetAll Error:', err)
      return errorResponse(c, '获取用户列表失败', 'SERVER_ERROR', 500)
    }
  },

  getById: async (c: Context) => {
    try {
      const id = c.req.param('id')
      const user = await userService.getUserById(id)

      if (!user) {
        return errorResponse(c, '用户不存在', 'USER_NOT_FOUND', 404)
      }

      return successResponse(c, user)
    } catch (err) {
      console.error('GetById Error:', err)
      return errorResponse(c, '获取用户信息失败', 'SERVER_ERROR', 500)
    }
  },

  update: async (c: Context) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()

      const patch: any = {}

      if (body.email !== undefined) {
        if (!validateEmail(body.email)) {
          return errorResponse(c, '邮箱格式无效', 'INVALID_INPUT', 400)
        }
        patch.email = body.email
      }

      if (body.password !== undefined) {
        if (typeof body.password !== 'string' || body.password.length < 8) {
          return errorResponse(
            c,
            '新密码长度不足（至少8位）',
            'INVALID_INPUT',
            400
          )
        }
        patch.password = body.password
      }

      if (Object.keys(patch).length === 0) {
        return errorResponse(c, '未提供任何更新字段', 'INVALID_INPUT', 400)
      }

      const updated = await userService.updateUser(id, patch)
      return successResponse(c, updated, '更新成功')
    } catch (err: any) {
      if (err.code === 'USER_NOT_FOUND')
        return errorResponse(c, '用户不存在', 'USER_NOT_FOUND', 404)
      if (err.code === 'EMAIL_EXISTS')
        return errorResponse(c, '该邮箱已被其他用户占用', 'EMAIL_EXISTS', 409)
      if (err.code === 'WEAK_PASSWORD')
        return errorResponse(c, '新密码强度不足', 'WEAK_PASSWORD', 400)

      console.error('Update Error:', err)
      return errorResponse(c, '更新失败', 'SERVER_ERROR', 500)
    }
  },

  delete: async (c: Context) => {
    try {
      const id = c.req.param('id')
      await userService.deleteUser(id)
      return successResponse(c, null, '删除成功')
    } catch (err) {
      console.error('Delete Error:', err)
      return errorResponse(c, '删除失败', 'SERVER_ERROR', 500)
    }
  },
}
