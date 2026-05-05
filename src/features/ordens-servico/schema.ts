import { z } from 'zod'

export const osSchema = z.object({
  clienteId: z.number(),
  tipoServico: z.enum(['instalacao', 'manutencao', 'troca_equipamento', 'infra', 'outro']),
  descricaoProblema: z.string().optional(),
  observacoes: z.string().optional(),
  prioridade: z.enum(['baixa', 'normal', 'alta']).default('normal'),
  dataAgendada: z.string().optional(),
  tecnicoId: z.number().optional(),
  valor: z.string().optional(),
  status: z.enum(['aberta', 'agendada', 'em_execucao', 'concluida', 'cancelada', 'reagendada', 'pendente']).default('aberta'),
})

export const osConclusaoSchema = z.object({
  dataInicioEfetivo: z.string().optional(),
  dataTerminoEfetivo: z.string().optional(),
  resultadoServico: z.boolean(),
  observacoesFinais: z.string().optional(),
  materiais: z.array(z.object({
    materialId: z.number(),
    quantidade: z.string(),
    tipoUso: z.enum(['comodato', 'venda', 'uso_interno']),
    localSaida: z.enum(['estoque_principal', 'estoque_tecnico']),
  })).default([]),
})

export const osReagendamentoSchema = z.object({
  motivoReagendamento: z.string().min(1, 'Motivo obrigatório'),
  novaDataAgendada: z.string().min(1, 'Nova data obrigatória'),
  tecnicoId: z.number().optional(),
})

export const osCancelamentoSchema = z.object({
  motivoCancelamento: z.string().min(1, 'Motivo obrigatório'),
  observacoes: z.string().optional(),
})

export type OsInput = z.input<typeof osSchema>
export type OsConclusaoInput = z.input<typeof osConclusaoSchema>
export type OsReagendamentoInput = z.input<typeof osReagendamentoSchema>
export type OsCancelamentoInput = z.input<typeof osCancelamentoSchema>
