import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { users, tecnicos } from '@/db/schema'
import { eq, or } from 'drizzle-orm'
import { loginSchema, changePasswordSchema } from './schema'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const login = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { identifier, password } = data

    // 1. Tenta buscar na tabela de users (admin/atendente)
    let user = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .then(res => res[0])

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (passwordMatch) {
        return {
          id: user.id,
          nome: user.nome,
          username: user.username,
          role: user.role,
          type: 'user' as const
        }
      }
    }

    // 2. Se não encontrou ou senha não bate, tenta na tabela de tecnicos
    const tecnico = await db
      .select()
      .from(tecnicos)
      .where(or(eq(tecnicos.email, identifier), eq(tecnicos.username, identifier)))
      .then(res => res[0])

    if (tecnico) {
      const passwordMatch = await bcrypt.compare(password, tecnico.passwordHash)
      if (passwordMatch) {
        return {
          id: tecnico.id,
          nome: tecnico.nome,
          username: tecnico.username,
          role: 'tecnico',
          type: 'tecnico' as const
        }
      }
    }

    throw new Error('E-mail/Usuário ou senha inválidos')
  })

export const changePassword = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    userId: z.number(),
    userType: z.enum(['user', 'tecnico']),
    data: changePasswordSchema
  }))
  .handler(async ({ data }) => {
    const { userId, userType, data: passwordData } = data
    
    let currentHash: string | undefined

    if (userType === 'user') {
      const [u] = await db.select().from(users).where(eq(users.id, userId))
      currentHash = u?.passwordHash
    } else {
      const [t] = await db.select().from(tecnicos).where(eq(tecnicos.id, userId))
      currentHash = t?.passwordHash
    }

    if (!currentHash) {
      throw new Error('Usuário não encontrado')
    }

    const passwordMatch = await bcrypt.compare(passwordData.currentPassword, currentHash)
    if (!passwordMatch) {
      throw new Error('Senha atual incorreta')
    }

    const newHash = await bcrypt.hash(passwordData.newPassword, 10)

    if (userType === 'user') {
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId))
    } else {
      await db.update(tecnicos).set({ passwordHash: newHash }).where(eq(tecnicos.id, userId))
    }

    return { success: true }
  })
