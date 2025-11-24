import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { SafeUser, FullUser } from '../db/types.js'

const safeSelect = {
  id: users.id,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
}

export const userRepo = {
  async findAll(): Promise<SafeUser[]> {
    try {
      return await db.select(safeSelect).from(users)
    } catch (err) {
      console.error('findAll error', err)
      throw new Error('DB_ERROR')
    }
  },

  async findById(id: string): Promise<SafeUser | null> {
    try {
      const result = await db
        .select(safeSelect)
        .from(users)
        .where(eq(users.id, id))
        .limit(1) // 优化查询
      return result[0] ?? null
    } catch (err) {
      console.error('findById error', err)
      throw new Error('DB_ERROR')
    }
  },

  async findByEmail(email: string): Promise<SafeUser | null> {
    try {
      const result = await db
        .select(safeSelect)
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      return result[0] ?? null
    } catch (err) {
      console.error('findByEmail error', err)
      throw new Error('DB_ERROR')
    }
  },

  async findByEmailWithPassword(email: string): Promise<FullUser | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      return result[0] ?? null
    } catch (err) {
      console.error('findByEmailWithPassword error', err)
      throw new Error('DB_ERROR')
    }
  },

  async createUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string } | null> {
    try {
      await db.insert(users).values({ email, password })
      const newUser = await this.findByEmail(email)

      if (newUser) {
        return { id: newUser.id, email: newUser.email }
      }

      throw { code: 'DB_CREATE_USER_FAIL' }
    } catch (err: any) {
      if (err.code === 'DB_CREATE_USER_FAIL') {
        throw { code: 'DB_CREATE_USER_FAIL' }
      }

      throw { code: 'DB_ERROR' }
    }
  },

  async updateUser(
    id: string,
    email?: string,
    password?: string
  ): Promise<SafeUser | null> {
    const updates: Partial<FullUser> = {}
    if (email) updates.email = email
    if (password) updates.password = password
    if (Object.keys(updates).length === 0) return await this.findById(id)

    try {
      const updateResult = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))

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
