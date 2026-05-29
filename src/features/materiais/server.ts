import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { materiais } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { materialSchema } from './schema'
import { z } from 'zod'

export const getMateriais = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.select().from(materiais)
  },
)

export const getMaterial = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [material] = await db
      .select()
      .from(materiais)
      .where(eq(materiais.id, data))
    return material
  })

export const createMaterial = createServerFn({ method: 'POST' })
  .inputValidator(materialSchema)
  .handler(async ({ data }) => {
    const [novo] = await db
      .insert(materiais)
      .values({
        codigo: data.codigo,
        descricao: data.descricao,
        categoria: data.categoria,
        unidade: data.unidade,
        quantidade: data.quantidade,
        estoqueMinimo: data.estoqueMinimo,
        comodato: data.comodato,
        status: data.status,
      })
      .returning()
    return novo
  })

export const updateMaterial = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: materialSchema }))
  .handler(async ({ data }) => {
    const [atualizado] = await db
      .update(materiais)
      .set({
        codigo: data.data.codigo,
        descricao: data.data.descricao,
        categoria: data.data.categoria,
        unidade: data.data.unidade,
        quantidade: data.data.quantidade,
        estoqueMinimo: data.data.estoqueMinimo,
        comodato: data.data.comodato,
        status: data.data.status,
      })
      .where(eq(materiais.id, data.id))
      .returning()
    return atualizado
  })

export const deleteMaterial = createServerFn({ method: 'POST' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    await db.delete(materiais).where(eq(materiais.id, data))
    return { success: true }
  })
