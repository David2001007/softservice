import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { atendenteSchema } from './schema'
import { z } from 'zod'

export const getAtendentes = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(users)
})

export const getAtendente = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [atendente] = await db.select().from(users).where(eq(users.id, data))
    return atendente
  })

export const createAtendente = createServerFn({ method: 'POST' })
  .inputValidator(atendenteSchema)
  .handler(async ({ data }) => {
    const [novo] = await db
      .insert(users)
      .values({
        codigo: `ATD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        username: data.username,
        passwordHash: data.password || 'default', // Em um cenário real, faça hash!
        role: data.role,
        ativo: true,
      })
      .returning()
    return novo
  })

export const updateAtendente = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: atendenteSchema }))
  .handler(async ({ data }) => {
    const [atualizado] = await db
      .update(users)
      .set({
        nome: data.data.nome,
        cpf: data.data.cpf,
        email: data.data.email,
        username: data.data.username,
        role: data.data.role,
        ...(data.data.password ? { passwordHash: data.data.password } : {}),
      })
      .where(eq(users.id, data.id))
      .returning()
    return atualizado
  })
