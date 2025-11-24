import { userRepo } from '../repositories/userRepo.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { sign } from 'hono/jwt'
import type { SafeUser } from '../db/types.js'

if (!process.env.JWT_SECRET) {
  // 边界处理：环境配置缺失
  throw new Error('JWT_SECRET not defined')
}

const SECRET = process.env.JWT_SECRET

export const userService = {
  async register(email: string, password: string) {
    if (password.length < 8) {
      throw { code: 'WEAK_PASSWORD' }
    }

    const hashed = await hashPassword(password)

    try {
      await userRepo.createUser(email, hashed)
    } catch (err: any) {
      if (err.code === 'DB_EMAIL_ALREADY_EXISTS') {
        throw { code: 'EMAIL_EXISTS' }
      }

      if (err.code === 'DB_ERROR' || err.code === 'DB_CREATE_USER_FAIL') {
        throw { code: 'SERVER_ERROR' }
      }
      throw err
    }
  },

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await userRepo.findByEmailWithPassword(email)
    // 边界处理 4: 用户不存在
    if (!user) throw { code: 'INVALID_CREDENTIALS' }

    const valid = await comparePassword(password, user.password)
    // 边界处理 5: 密码不匹配
    if (!valid) throw { code: 'INVALID_CREDENTIALS' }

    // JWT 逻辑不变 (边界处理 6: JWT 过期时间可以考虑缩短)
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 // 缩短到 1 天

    const token = await sign(
      { sub: user.id, email: user.email, iat: now, exp },
      SECRET
    )
    return { token }
  },

  async getAllUsers(): Promise<SafeUser[]> {
    return await userRepo.findAll()
  },

  async getUserById(id: string): Promise<SafeUser | null> {
    return await userRepo.findById(id)
  },

  async updateUser(
    id: string,
    patch: { email?: string; password?: string }
  ): Promise<SafeUser | null> {
    const updateData: { email?: string; password?: string } = {}

    // 边界处理 7: 更新密码时也需要强度校验
    if (patch.password) {
      if (patch.password.length < 8) {
        throw { code: 'WEAK_PASSWORD' }
      }
      updateData.password = await hashPassword(patch.password)
    }

    if (patch.email) updateData.email = patch.email

    // Repo 层已经处理了更新字段为空的情况
    try {
      const updatedUser = await userRepo.updateUser(
        id,
        updateData.email,
        updateData.password
      )
      if (!updatedUser) {
        throw { code: 'USER_NOT_FOUND' } // 如果更新返回 null (ID不存在)
      }
      return updatedUser
    } catch (err: any) {
      // 边界处理 8: 捕获更新时邮箱重复的错误
      if (err.message === 'DB_EMAIL_ALREADY_EXISTS') {
        throw { code: 'EMAIL_EXISTS' }
      }
      throw { code: 'SERVER_ERROR' }
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    return await userRepo.deleteUser(id)
  },
}
