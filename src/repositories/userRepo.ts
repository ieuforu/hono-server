import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export const userRepo = {
  async findAll() {
    return await db.select().from(users)
  },

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] ?? null
  },

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] ?? null
  },

  async createUser(email: string, password: string) {
    const id = uuidv4()
    const result = await db.insert(users).values({
      id,
      email,
      password,
      // createdAt 会用 CURRENT_TIMESTAMP
    })
    return { id, email }
  },

  async updateUser(id: string, email?: string, password?: string) {
    const updates: any = {}
    if (email) updates.email = email
    if (password) updates.password = password

    await db.update(users).set(updates).where(eq(users.id, id))
    return await userRepo.findById(id)
  },

  async deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id))
    return true
  },
}
