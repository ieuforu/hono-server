import type { InferSelectModel } from 'drizzle-orm'
import { users } from './schema.js'

// 自动生成用户类型，并排除 password 字段
export type DBUser = InferSelectModel<typeof users>
export type SafeUser = Omit<DBUser, 'password'>
export type FullUser = DBUser // 用于需要密码的场景 (如登录)
