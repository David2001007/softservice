import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { ordensServico, osHistorico, osMateriais, materiais } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { osSchema, osConclusaoSchema, osReagendamentoSchema, osCancelamentoSchema } from './schema'
import { z } from 'zod'

export const getOrdensServico = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.query.ordensServico.findMany({
    with: {
      cliente: true,
      tecnico: true,
    },
    orderBy: (os, { desc }) => [desc(os.createdAt)],
  })
})

export const getOrdemServico = createServerFn({ method: 'GET' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const os = await db.query.ordensServico.findFirst({
      where: eq(ordensServico.id, data),
      with: {
        cliente: true,
        tecnico: true,
        materiais: { with: { material: true } },
        historico: { with: { usuario: true }, orderBy: (h, { desc }) => [desc(h.dataHora)] },
      },
    })
    return os
  })

export const createOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(osSchema)
  .handler(async ({ data }) => {
    const [novaOs] = await db
      .insert(ordensServico)
      .values({
        numero: `OS${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        clienteId: data.clienteId,
        tipoServico: data.tipoServico,
        descricaoProblema: data.descricaoProblema,
        observacoes: data.observacoes,
        prioridade: data.prioridade,
        dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : null,
        tecnicoId: data.tecnicoId,
        valor: data.valor || null,
        status: data.status,
      })
      .returning()
      
    // Registrar no histórico
    await db.insert(osHistorico).values({
      osId: novaOs.id,
      acao: 'criacao',
      statusNovo: novaOs.status,
      detalhes: 'OS criada pelo sistema',
    })

    return novaOs
  })

export const concluirOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: osConclusaoSchema }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      // 1. Atualizar a OS
      const [osAtualizada] = await tx
        .update(ordensServico)
        .set({
          status: 'concluida',
          dataInicioEfetivo: data.data.dataInicioEfetivo ? new Date(data.data.dataInicioEfetivo) : null,
          dataTerminoEfetivo: data.data.dataTerminoEfetivo ? new Date(data.data.dataTerminoEfetivo) : null,
          resultadoServico: data.data.resultadoServico,
          observacoesFinais: data.data.observacoesFinais,
        })
        .where(eq(ordensServico.id, data.id))
        .returning()

      // 2. Registrar Materiais Utilizados e Dar Baixa no Estoque
      if (data.data.materiais.length > 0) {
        for (const mat of data.data.materiais) {
          const quantidade = Number(mat.quantidade)
          if (!Number.isFinite(quantidade) || quantidade <= 0) {
            throw new Error('Quantidade de material inválida')
          }

          await tx.insert(osMateriais).values({
            osId: data.id,
            materialId: mat.materialId,
            quantidade: String(quantidade),
            tipoUso: mat.tipoUso,
            localSaida: mat.localSaida,
          })
          
          // Baixa de estoque
          await tx
            .update(materiais)
            .set({ quantidade: sql`${materiais.quantidade} - ${quantidade}` })
            .where(eq(materiais.id, mat.materialId))
        }
      }

      // 3. Registrar Histórico
      await tx.insert(osHistorico).values({
        osId: data.id,
        acao: 'conclusao',
        statusNovo: 'concluida',
        detalhes: 'OS finalizada pelo técnico',
      })

      return osAtualizada
    })
  })

export const reagendarOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: osReagendamentoSchema }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      const [osAtualizada] = await tx
        .update(ordensServico)
        .set({
          status: 'reagendada',
          dataAgendada: new Date(data.data.novaDataAgendada),
          ...(data.data.tecnicoId ? { tecnicoId: data.data.tecnicoId } : {}),
        })
        .where(eq(ordensServico.id, data.id))
        .returning()

      await tx.insert(osHistorico).values({
        osId: data.id,
        acao: 'reagendamento',
        statusNovo: 'reagendada',
        motivo: data.data.motivoReagendamento,
        detalhes: `Reagendado para ${data.data.novaDataAgendada}`,
      })

      return osAtualizada
    })
  })

export const cancelarOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: osCancelamentoSchema }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      const [osAtualizada] = await tx
        .update(ordensServico)
        .set({
          status: 'cancelada',
          motivoCancelamento: data.data.motivoCancelamento,
          dataCancelamento: new Date(),
        })
        .where(eq(ordensServico.id, data.id))
        .returning()

      await tx.insert(osHistorico).values({
        osId: data.id,
        acao: 'cancelamento',
        statusNovo: 'cancelada',
        motivo: data.data.motivoCancelamento,
        detalhes: data.data.observacoes || 'Cancelado sem observações',
      })

      return osAtualizada
    })
  })

export const updateOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), data: osSchema }))
  .handler(async ({ data }) => {
    const [atualizada] = await db
      .update(ordensServico)
      .set({
        clienteId: data.data.clienteId,
        tipoServico: data.data.tipoServico,
        descricaoProblema: data.data.descricaoProblema,
        observacoes: data.data.observacoes,
        prioridade: data.data.prioridade,
        dataAgendada: data.data.dataAgendada ? new Date(data.data.dataAgendada) : null,
        tecnicoId: data.data.tecnicoId,
        valor: data.data.valor || null,
        status: data.data.status,
      })
      .where(eq(ordensServico.id, data.id))
      .returning()
    return atualizada
  })

export const deleteOrdemServico = createServerFn({ method: 'POST' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    await db.delete(ordensServico).where(eq(ordensServico.id, data))
    return { success: true }
  })

export const iniciarAtendimento = createServerFn({ method: 'POST' })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      const [osAtualizada] = await tx
        .update(ordensServico)
        .set({
          status: 'em_execucao',
        })
        .where(eq(ordensServico.id, data))
        .returning()

      await tx.insert(osHistorico).values({
        osId: data,
        acao: 'atualizacao',
        statusNovo: 'em_execucao',
        detalhes: 'Atendimento iniciado',
      })

      return osAtualizada
    })
  })
