import { verify } from 'hono/jwt'

const SECRET = process.env.JWT_SECRET || 'secret'

export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization') // 👈 用 .header()，不是 .headers.get()

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7) // 安全取 token

  try {
    const payload = await verify(token, SECRET)
    c.set('user', payload) // 👈 用 c.set，不是 c.req.user
    await next()
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401) // 👈 catch 异常
  }
}
