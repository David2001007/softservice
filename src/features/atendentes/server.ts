import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, or  } from 'drizzle-orm'
import { atendenteSchema } from './schema'
import { z } from 'zod'

import bcrypt from 'bcryptjs'

export const getAtendentes = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.select().from(users)
  },
)

export const getAtendente = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [atendente] = await db.select().from(users).where(eq(users.id, data))
    return atendente
  })

export const createAtendente = createServerFn({ method: 'POST' })
  .inputValidator(atendenteSchema)
  .handler(async ({ data }) => {
    // Validação de unicidade
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, data.email), eq(users.username, data.username)))
      .then((res) => res[0])

    if (existing) {
      throw new Error('E-mail ou Usuário já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(data.password ?? '', 10)

    const [novo] = await db
      .insert(users)
      .values({
        codigo: `ATD-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        role: data.role,
        ativo: true,
      })
      .returning()
    return novo
  })

export const updateAtendente = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: atendenteSchema }))
  .handler(async ({ data }) => {
    // Validação de unicidade (excluindo o próprio registro)
    const existing = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, data.data.email),
          eq(users.username, data.data.username),
        ),
      )
      .then((res) => res.filter((u) => u.id !== data.id)[0])

    if (existing) {
      throw new Error('E-mail ou Usuário já cadastrado por outro atendente')
    }

    const setValues: any = {
      nome: data.data.nome,
      cpf: data.data.cpf,
      email: data.data.email,
      username: data.data.username,
      role: data.data.role,
    }

    if (data.data.password) {
      setValues.passwordHash = await bcrypt.hash(data.data.password, 10)
    }

    const [atualizado] = await db
      .update(users)
      .set(setValues)
      .where(eq(users.id, data.id))
      .returning()
    return atualizado
  })

export const deleteAtendente = createServerFn({ method: 'POST' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    await db.delete(users).where(eq(users.id, data))
    return { success: true }
  })
