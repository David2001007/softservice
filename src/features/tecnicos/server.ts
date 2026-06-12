import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { tecnicos } from '@/db/schema'
import { eq, or  } from 'drizzle-orm'
import { tecnicoSchema } from './schema'
import { z } from 'zod'

import bcrypt from 'bcryptjs'

export const getTecnicos = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.select().from(tecnicos)
  },
)

export const getTecnico = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [tecnico] = await db
      .select()
      .from(tecnicos)
      .where(eq(tecnicos.id, data))
    return tecnico
  })

export const createTecnico = createServerFn({ method: 'POST' })
  .inputValidator(tecnicoSchema)
  .handler(async ({ data }) => {
    // Validação de unicidade
    const existing = await db
      .select()
      .from(tecnicos)
      .where(
        or(
          eq(tecnicos.email, data.email),
          eq(tecnicos.username, data.username),
        ),
      )
      .then((res) => res[0])

    if (existing) {
      throw new Error('E-mail ou Usuário já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(data.password ?? '', 10)

    const [novo] = await db
      .insert(tecnicos)
      .values({
        codigo: `TEC-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
        nome: data.nome,
        tipo: data.tipo,
        empresa: data.empresa,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        regiao: data.regiao,
        especialidade: data.especialidade,
        perfil: data.perfil,
        username: data.username,
        passwordHash: hashedPassword,
        ativo: data.ativo,
      })
      .returning()
    return novo
  })

export const updateTecnico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: tecnicoSchema }))
  .handler(async ({ data }) => {
    // Validação de unicidade (excluindo o próprio registro)
    const existing = await db
      .select()
      .from(tecnicos)
      .where(
        or(
          eq(tecnicos.email, data.data.email),
          eq(tecnicos.username, data.data.username),
        ),
      )
      .then((res) => res.filter((t) => t.id !== data.id)[0])

    if (existing) {
      throw new Error('E-mail ou Usuário já cadastrado por outro técnico')
    }

    const setValues: any = {
      nome: data.data.nome,
      tipo: data.data.tipo,
      empresa: data.data.empresa,
      cnpj: data.data.cnpj,
      telefone: data.data.telefone,
      email: data.data.email,
      regiao: data.data.regiao,
      especialidade: data.data.especialidade,
      perfil: data.data.perfil,
      username: data.data.username,
      ativo: data.data.ativo,
    }

    if (data.data.password) {
      setValues.passwordHash = await bcrypt.hash(data.data.password, 10)
    }

    const [atualizado] = await db
      .update(tecnicos)
      .set(setValues)
      .where(eq(tecnicos.id, data.id))
      .returning()
    return atualizado
  })

export const deleteTecnico = createServerFn({ method: 'POST' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    await db.delete(tecnicos).where(eq(tecnicos.id, data))
    return { success: true }
  })
