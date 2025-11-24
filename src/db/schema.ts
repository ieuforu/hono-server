import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'
import { type InferSelectModel, type InferInsertModel, sql } from 'drizzle-orm'

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => new Date()),
})
