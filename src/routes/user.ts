import { Hono } from 'hono'
import { userController } from '../controllers/userController.js'

export const userRouter = new Hono()

userRouter.post('/register', userController.register)
userRouter.post('/login', userController.login)
userRouter.get('/test', c => c.text('User router works'))

userRouter.get('/', userController.getAll)
userRouter.get('/:id', userController.getById)
userRouter.put('/:id', userController.update)
userRouter.delete('/:id', userController.delete)
