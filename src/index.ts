import { Hono } from 'hono'
import { userRouter } from './routes/user.js'
import { logger } from 'hono/logger'
import { userController } from './controllers/userController.js'
import { authMiddleware } from './middlewares/auth.js'

const app = new Hono()
app.use(logger())

app.post('/api/users/register', userController.register)
app.post('/api/users/login', userController.login)

app.use('/api/users/*', authMiddleware)
app.route('/api/users', userRouter)

export default app
