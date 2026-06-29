import crypto from 'crypto'
import {
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/start-server-core/request-response'

const AUTH_COOKIE_NAME = 'unite_session'
// In a real app, this should be in process.env.JWT_SECRET
const SECRET = process.env.SESSION_SECRET || 'unite-super-secret-key-2026'

export interface AuthContext {
  userId: number
  userType: 'user' | 'tecnico'
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export async function setAuthCookie(
  userId: number,
  userType: 'user' | 'tecnico',
) {
  const payload = `${userId}:${userType}`
  const signature = sign(payload)
  const cookieValue = `${payload}.${signature}`

  setCookie(AUTH_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  deleteCookie(AUTH_COOKIE_NAME, { path: '/' })
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const cookieValue = getCookie(AUTH_COOKIE_NAME)
    if (!cookieValue) return null

    const parts = cookieValue.split('.')
    if (parts.length !== 2) return null

    const [payload, signature] = parts
    const expectedSignature = sign(payload)

    if (signature !== expectedSignature) {
      return null
    }

    const [userIdStr, userType] = payload.split(':')
    const userId = parseInt(userIdStr, 10)

    if (isNaN(userId) || (userType !== 'user' && userType !== 'tecnico')) {
      return null
    }

    return { userId, userType }
  } catch (e) {
    console.error('Error parsing auth cookie:', e)
    return null
  }
}

export async function requireTecnicoOrAdmin(): Promise<AuthContext> {
  const context = await getAuthContext()
  if (!context) {
    throw new Error('Não autorizado. Por favor, faça login.')
  }
  return context
}

export async function requireAdmin(): Promise<AuthContext> {
  const context = await getAuthContext()
  if (!context || context.userType !== 'user') {
    throw new Error('Acesso negado. Apenas administradores permitidos.')
  }
  return context
}
