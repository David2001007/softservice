import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { materiais } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { materialSchema } from './schema'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-server'
import { getAuthContext } from '@/lib/auth-server'

export const getMateriais = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await getAuthContext()
    if (auth && auth.userType === 'tecnico') {
      return await db
        .select()
        .from(materiais)
        .where(eq(materiais.assignedTecnicoId, auth.userId))
    }
    return await db.select().from(materiais)
  },
)

export const getMaterial = createServerFn({ method: 'GET' })
  .validator(z.number())
  .handler(async ({ data }) => {
    const auth = await getAuthContext()
    const [material] = await db
      .select()
      .from(materiais)
      .where(eq(materiais.id, data))

    if (
      auth?.userType === 'tecnico' &&
      material &&
      material.assignedTecnicoId !== auth.userId
    ) {
      return undefined
    }

    return material
  })

export const createMaterial = createServerFn({ method: 'POST' })
  .validator(materialSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
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
        assignedTecnicoId: data.assignedTecnicoId ?? null,
      })
      .returning()
    return novo
  })

export const updateMaterial = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number(), data: materialSchema }))
  .handler(async ({ data }) => {
    await requireAdmin()
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
        assignedTecnicoId: data.data.assignedTecnicoId ?? null,
      })
      .where(eq(materiais.id, data.id))
      .returning()
    return atualizado
  })

export const deleteMaterial = createServerFn({ method: 'POST' })
  .validator(z.number())
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.delete(materiais).where(eq(materiais.id, data))
    return { success: true }
  })
