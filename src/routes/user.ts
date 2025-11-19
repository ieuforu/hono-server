import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { userController } from '../controllers/userController.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

const authMiddleware = jwt({
  secret: process.env.JWT_SECRET,
})

const userRouter = new Hono()

// Public
userRouter.post('/register', userController.register)
userRouter.post('/login', userController.login)

// Protected (每个路由单独加 jwt)
userRouter.get('/', (c, next) => authMiddleware(c, next), userController.getAll)
userRouter.get(
  '/:id',
  (c, next) => authMiddleware(c, next),
  userController.getById
)
userRouter.put(
  '/:id',
  (c, next) => authMiddleware(c, next),
  userController.update
)
userRouter.delete(
  '/:id',
  (c, next) => authMiddleware(c, next),
  userController.delete
)

export { userRouter }
