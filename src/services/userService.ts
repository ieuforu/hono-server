import { userRepo } from '../repositories/userRepo.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { sign } from 'hono/jwt'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

const SECRET = process.env.JWT_SECRET

export const userService = {
  async register(email: string, password: string) {
    const exists = await userRepo.findByEmail(email)
    if (exists) throw { code: 'EMAIL_EXISTS' }

    const hashed = await hashPassword(password)
    await userRepo.createUser(email, hashed)
  },

  async login(email: string, password: string) {
    const user = await userRepo.findByEmailWithPassword(email)
    if (!user) throw { code: 'INVALID_CREDENTIALS' }

    const valid = await comparePassword(password, user.password)
    if (!valid) throw { code: 'INVALID_CREDENTIALS' }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 3

    const token = await sign(
      { sub: user.id, email: user.email, iat: now, exp },
      SECRET
    )
    return { token }
  },

  async getAllUsers() {
    return await userRepo.findAll() // 已经隐藏 password
  },

  async getUserById(id: string) {
    return await userRepo.findById(id) // 已经隐藏 password
  },

  async updateUser(id: string, patch: { email?: string; password?: string }) {
    const updateData: { email?: string; password?: string } = {}
    if (patch.email) updateData.email = patch.email
    if (patch.password) updateData.password = await hashPassword(patch.password)

    return await userRepo.updateUser(id, updateData.email, updateData.password)
  },

  async deleteUser(id: string) {
    return await userRepo.deleteUser(id)
  },
}
