import { userRepo } from '../repositories/userRepo.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { sign } from 'hono/jwt'

const SECRET = process.env.JWT_SECRET || 'secret'

export const userService = {
  async register(email: string, password: string) {
    const exists = await userRepo.findByEmail(email)
    if (exists) throw new Error('EMAIL_EXISTS')

    const hashed = await hashPassword(password)
    await userRepo.createUser(email, hashed)
  },

  async login(email: string, password: string) {
    // token 3天过期
    const exp = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60
    const user = await userRepo.findByEmail(email)

    if (!user) throw new Error('INVALID_CREDENTIALS')

    const valid = await comparePassword(password, user.password)

    if (!valid) throw new Error('INVALID_CREDENTIALS')

    const token = await sign({ sub: user.id, email: user.email, exp }, SECRET)

    return { token }
  },

  async getAllUsers() {
    return await userRepo.findAll()
  },

  async getUserById(id: string) {
    return await userRepo.findById(id)
  },

  async updateUser(id: string, email?: string, password?: string) {
    let hashedPassword
    if (password) hashedPassword = await hashPassword(password)
    return await userRepo.updateUser(id, email, hashedPassword)
  },

  async deleteUser(id: string) {
    return await userRepo.deleteUser(id)
  },
}
