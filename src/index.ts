import { Hono } from 'hono'
import { userRouter } from './routes/user.js'
import { logger } from 'hono/logger'
import { userController } from './controllers/userController.js'
import { jwt } from 'hono/jwt'

const app = new Hono()
app.use(logger())

app.post('/api/users/register', userController.register)
app.post('/api/users/login', userController.login)

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

app.use(
  '/api/users/*',
  jwt({
    secret:
      process.env.JWT_SECRET ||
      'fd93e2f3253b1d515b1982c0f5416a5009223441efd28ca92e249f202785bf39',
    // 可选：自定义错误响应（默认已是 401）
    // onInvalid: (c) => c.json({ error: 'Invalid or expired token' }, 401),
  })
)
app.route('/api/users', userRouter)

export default app
