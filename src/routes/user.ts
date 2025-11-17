import { Hono } from 'hono'
import { userController } from '../controllers/userController.js'

export const userRouter = new Hono()

  .post('/register', userController.register)
  .post('/login', userController.login)
  .get('/', userController.getAll)
  .get('/:id', userController.getById)
  .put('/:id', userController.update)
  .delete('/:id', userController.delete)
