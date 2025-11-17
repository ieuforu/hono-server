import { verify } from 'hono/jwt'

const SECRET = process.env.JWT_SECRET || 'secret'

export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')

  const payload = await verify(token, SECRET)
  if (!payload) return c.json({ error: 'Unauthorized' }, 401)

  c.req.user = payload
  await next()
}
