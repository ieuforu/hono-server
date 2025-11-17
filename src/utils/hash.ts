import bcrypt from 'bcryptjs'

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10)
export const comparePassword = bcrypt.compare
