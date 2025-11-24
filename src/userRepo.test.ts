import { describe, it, expect, beforeAll } from 'bun:test'
import { userRepo } from './repositories/userRepo.js'
import { db } from './db/index.js'
import { users } from './db/schema.js'

describe('userRepo 完整功能测试', () => {
  let testUserId: string

  beforeAll(async () => {
    await db.delete(users)
  })

  it('createUser - 成功创建用户', async () => {
    const user = await userRepo.createUser(
      'test@example.com',
      'SecureP@ssword123'
    )
    testUserId = user!.id
    expect(user).toHaveProperty('id')
    expect(user!.email).toBe('test@example.com')
  })

  it('findByEmail - 查找用户', async () => {
    const user = await userRepo.findByEmail('test@example.com')
    expect(user).not.toBeNull()
    expect(user?.email).toBe('test@example.com')
    expect(user).not.toHaveProperty('password')
  })

  it('findById - 查找用户', async () => {
    const user = await userRepo.findById(testUserId)
    expect(user).not.toBeNull()
    expect(user?.id).toBe(testUserId)
    expect(user).not.toHaveProperty('password')
  })

  it('findAll - 返回用户数组', async () => {
    const users = await userRepo.findAll()
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)
    expect(users[0]).not.toHaveProperty('password')
  })

  it('updateUser - 更新邮箱', async () => {
    const user = await userRepo.updateUser(testUserId, 'new@example.com')
    expect(user?.email).toBe('new@example.com')
    expect(user).not.toHaveProperty('password')
  })

  it('deleteUser - 删除用户', async () => {
    const result = await userRepo.deleteUser(testUserId)
    expect(result).toBe(true)
    const user = await userRepo.findById(testUserId)
    expect(user).toBeNull()
  })
})
