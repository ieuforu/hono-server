import { serve } from '@hono/node-server'
import { Hono } from 'hono';
import userRouter from './routes/user.js'

const app = new Hono()

app.route('/api', userRouter);

app.get('/', (c) => {
  return c.html(`<h1>hello hono</h1>`)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


export default app;