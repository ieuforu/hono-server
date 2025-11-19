import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export interface SafeUser {
  id: string
  email: string
  createdAt: Date
}

export const userRepo = {
  async findAll(): Promise<SafeUser[]> {
    try {
      const result = await db.select().from(users)
      return result.map(({ password, ...safeUser }) => safeUser)
    } catch (err) {
      console.error('findAll error', err)
      throw new Error('DB_ERROR')
    }
  },

  async findById(id: string): Promise<SafeUser | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id))
      if (!result[0]) return null
      const { password, ...safeUser } = result[0]
      return safeUser
    } catch (err) {
      console.error('findById error', err)
      throw new Error('DB_ERROR')
    }
  },

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email))
    if (!result[0]) return null
    const { password, ...safeUser } = result[0]
    return safeUser
  },
  async findByEmailWithPassword(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email))
      return result[0] ?? null // 包含 password
    } catch (err) {
      console.error('findByEmailWithPassword error', err)
      throw new Error('DB_ERROR')
    }
  },
  async createUser(email: string, password: string) {
    const id = uuidv4()
    try {
      await db.insert(users).values({ id, email, password })
      return { id, email }
    } catch (err) {
      console.error('createUser error', err)
      throw new Error('DB_ERROR')
    }
  },

  async updateUser(id: string, email?: string, password?: string) {
    const updates: Partial<{ email: string; password: string }> = {}
    if (email) updates.email = email
    if (password) updates.password = password
    if (Object.keys(updates).length === 0) return await this.findById(id)

    try {
      await db.update(users).set(updates).where(eq(users.id, id))
      return await this.findById(id)
    } catch (err) {
      console.error('updateUser error', err)
      throw new Error('DB_ERROR')
    }
  },

  async deleteUser(id: string) {
    try {
      await db.delete(users).where(eq(users.id, id))
      return true
    } catch (err) {
      console.error('deleteUser error', err)
      throw new Error('DB_ERROR')
    }
  },
}
