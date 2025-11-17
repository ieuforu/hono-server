import { Hono } from 'hono'
import { userRouter } from './routes/user.js'

const app = new Hono()

app.route('/api/users', userRouter)

app.get('/', c => {
  return c.html(`<h1>hello hono</h1>`)
})

// export default {
//   port: 3000,
//   fetch: app.fetch,
// }

export default app
