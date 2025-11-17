import { Hono } from 'hono'
import { userRouter } from './routes/user.js'
import { logger } from 'hono/logger'

const app = new Hono()
app.use(logger())
app.route('/api/users', userRouter)

app.get('/', c => {
  return c.html(`<h1>hello hono</h1>`)
})

// export default {
//   port: 3000,
//   fetch: app.fetch,
// }

export default app
