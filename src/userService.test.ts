import { describe, it, expect, beforeAll } from 'bun:test'
import { userService } from './services/userService.js'
import { userRepo } from './repositories/userRepo.js'
import { db } from './db/index.js'
import { users } from './db/schema.js'

describe('userService 完整功能测试', () => {
  let testUserId: string
  const testEmail = 'test@example.com'
  const testPassword = '123456'

  beforeAll(async () => {
    // 清空 users 表
    await db.delete(users)
  })

  it('register - 成功注册用户', async () => {
    await userService.register(testEmail, testPassword)
    const user = await userRepo.findByEmail(testEmail)
    expect(user).not.toBeNull()
    expect(user?.email).toBe(testEmail)
    testUserId = user!.id
  })

  it('register - 重复注册抛错', async () => {
    let error
    try {
      await userService.register(testEmail, testPassword)
    } catch (err: any) {
      error = err
    }
    expect(error).toBeDefined()
    expect(error.code).toBe('EMAIL_EXISTS')
  })

  it('login - 成功登录返回 token', async () => {
    const result = await userService.login(testEmail, testPassword)
    expect(result).toHaveProperty('token')
    expect(typeof result.token).toBe('string')
  })

  it('login - 错误密码抛错', async () => {
    let error
    try {
      await userService.login(testEmail, 'wrongpassword')
    } catch (err: any) {
      error = err
    }
    expect(error).toBeDefined()
    expect(error.code).toBe('INVALID_CREDENTIALS')
  })

  it('getAllUsers - 返回用户数组，不包含 password', async () => {
    const usersArr = await userService.getAllUsers()
    expect(Array.isArray(usersArr)).toBe(true)
    expect(usersArr[0].email).toBe(testEmail)
    expect((usersArr[0] as any).password).toBeUndefined()
  })

  it('getUserById - 返回单个用户，不包含 password', async () => {
    const user = await userService.getUserById(testUserId)
    expect(user).not.toBeNull()
    expect(user!.id).toBe(testUserId)
    expect((user as any).password).toBeUndefined()
  })

  it('updateUser - 更新邮箱和密码', async () => {
    const newEmail = 'new@example.com'
    await userService.updateUser(testUserId, {
      email: newEmail,
      password: 'newpass',
    })
    const user = await userService.getUserById(testUserId)
    expect(user!.email).toBe(newEmail)

    // 用新密码登录验证
    const loginResult = await userService.login(newEmail, 'newpass')
    expect(loginResult).toHaveProperty('token')
  })

  it('deleteUser - 删除用户', async () => {
    const result = await userService.deleteUser(testUserId)
    expect(result).toBe(true)
    const user = await userService.getUserById(testUserId)
    expect(user).toBeNull()
  })
})
