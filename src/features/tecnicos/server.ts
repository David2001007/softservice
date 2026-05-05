import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { tecnicos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { tecnicoSchema } from './schema'
import { z } from 'zod'

export const getTecnicos = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(tecnicos)
})

export const getTecnico = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [tecnico] = await db.select().from(tecnicos).where(eq(tecnicos.id, data))
    return tecnico
  })

export const createTecnico = createServerFn({ method: 'POST' })
  .inputValidator(tecnicoSchema)
  .handler(async ({ data }) => {
    const [novo] = await db
      .insert(tecnicos)
      .values({
        codigo: `TEC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        nome: data.nome,
        tipo: data.tipo,
        empresa: data.empresa,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email || null,
        regiao: data.regiao,
        especialidade: data.especialidade,
        perfil: data.perfil,
        username: data.username,
        passwordHash: data.password || 'default', // Em um cenário real, faça hash!
        ativo: data.ativo,
      })
      .returning()
    return novo
  })

export const updateTecnico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: tecnicoSchema }))
  .handler(async ({ data }) => {
    const [atualizado] = await db
      .update(tecnicos)
      .set({
        nome: data.data.nome,
        tipo: data.data.tipo,
        empresa: data.data.empresa,
        cnpj: data.data.cnpj,
        telefone: data.data.telefone,
        email: data.data.email || null,
        regiao: data.data.regiao,
        especialidade: data.data.especialidade,
        perfil: data.data.perfil,
        username: data.data.username,
        ativo: data.data.ativo,
      })
      .where(eq(tecnicos.id, data.id))
      .returning()
    return atualizado
  })
