import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { users, tecnicos } from '@/db/schema'
import { eq, or } from 'drizzle-orm'
import { loginSchema } from './schema'
import bcrypt from 'bcryptjs'

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
          type: 'user'
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
          type: 'tecnico'
        }
      }
    }

    throw new Error('E-mail/Usuário ou senha inválidos')
  })
