import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { clienteSchema } from './schema'
import { z } from 'zod'

export const getClientes = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(clientes)
})

export const getCliente = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, data))
    return cliente
  })

export const createCliente = createServerFn({ method: 'POST' })
  .inputValidator(clienteSchema)
  .handler(async ({ data }) => {
    const [novoCliente] = await db
      .insert(clientes)
      .values({
        codigo: `CLI-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        nome: data.nome,
        cpfCnpj: data.cpfCnpj,
        telefone: data.telefone,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        referencia: data.referencia,
        plano: data.plano,
        situacaoContrato: data.situacaoContrato,
        status: data.status,
      })
      .returning()
    return novoCliente
  })

export const updateCliente = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: clienteSchema }))
  .handler(async ({ data }) => {
    const [atualizado] = await db
      .update(clientes)
      .set({
        nome: data.data.nome,
        cpfCnpj: data.data.cpfCnpj,
        telefone: data.data.telefone,
        cep: data.data.cep,
        logradouro: data.data.logradouro,
        numero: data.data.numero,
        complemento: data.data.complemento,
        bairro: data.data.bairro,
        cidade: data.data.cidade,
        uf: data.data.uf,
        referencia: data.data.referencia,
        plano: data.data.plano,
        situacaoContrato: data.data.situacaoContrato,
        status: data.data.status,
      })
      .where(eq(clientes.id, data.id))
      .returning()
    return atualizado
  })
