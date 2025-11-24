import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * 统一成功响应
 */
export const successResponse = (
  c: Context,
  data: any = null,
  message: string = 'Success',
  status: number = 200
) => {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status as ContentfulStatusCode
  )
}

/**
 * 统一错误响应
 */
export const errorResponse = (
  c: Context,
  message: string,
  code: string = 'SERVER_ERROR',
  status: number = 500
) => {
  return c.json(
    {
      success: false,
      message,
      code,
    },
    status as ContentfulStatusCode
  )
}
