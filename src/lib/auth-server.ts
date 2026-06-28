import crypto from 'crypto'

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

async function importServerCookieHelpers() {
  return await import('@tanstack/start-server-core/request-response')
}

export async function setAuthCookie(userId: number, userType: 'user' | 'tecnico') {
  const payload = `${userId}:${userType}`
  const signature = sign(payload)
  const cookieValue = `${payload}.${signature}`

  // If running in a browser (client-side), set via document.cookie
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 7
    const secure = process.env.NODE_ENV === 'production'
    document.cookie = `${AUTH_COOKIE_NAME}=${cookieValue}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`
    return
  }

  const { setCookie } = await importServerCookieHelpers()
  if (typeof setCookie === 'function') {
    setCookie(AUTH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } else {
    console.warn('setAuthCookie: start-server-core setCookie() unavailable')
  }
}

export async function clearAuthCookie() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    return
  }

  const { deleteCookie } = await importServerCookieHelpers()
  if (typeof deleteCookie === 'function') {
    deleteCookie(AUTH_COOKIE_NAME, {
      path: '/',
    })
  } else {
    console.warn('clearAuthCookie: start-server-core deleteCookie() unavailable')
  }
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    // Client-side: read document.cookie
    let cookieValue: string | undefined
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const cookies = document.cookie.split('; ').map((c) => c.split('='))
      for (const [k, ...v] of cookies) {
        if (k === AUTH_COOKIE_NAME) {
          cookieValue = v.join('=')
          break
        }
      }
    } else {
      const { getCookie } = await importServerCookieHelpers()
      if (typeof getCookie === 'function') {
        cookieValue = getCookie(AUTH_COOKIE_NAME)
      } else {
        cookieValue = undefined
        console.warn('getAuthContext: start-server-core getCookie() unavailable')
      }
    }
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
