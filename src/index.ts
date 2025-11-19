import { Hono } from 'hono'
import { userRouter } from './routes/user.js'
import { logger } from 'hono/logger'

const app = new Hono()
app.use(logger())

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

app.route('/api/users', userRouter)

export default app
