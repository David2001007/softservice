import { z } from 'zod'

export const osSchema = z.object({
  clienteId: z.coerce.number().min(1, 'O cliente é obrigatório.'),
  tipoServico: z.enum([
    'instalacao',
    'manutencao',
    'troca_equipamento',
    'infra',
    'outro',
  ], {
    message: 'Selecione um tipo de serviço válido.'
  }),
  descricaoProblema: z.string().optional(),
  observacoes: z.string().optional(),
  prioridade: z.enum(['baixa', 'normal', 'alta']).default('normal'),
  dataAgendada: z.string().optional(),
  dataAgendadaDate: z.string().optional(),
  dataAgendadaTime: z.string().optional(),
  tecnicoId: z.coerce.number().optional().transform(v => v === 0 ? undefined : v),
  valor: z.string().optional(),
  status: z.enum([
    'aberta',
    'agendada',
    'em_execucao',
    'concluida',
    'cancelada',
    'reagendada',
    'pendente',
  ]).default('aberta'),
})

export const osConclusaoSchema = z.object({
  dataInicioEfetivo: z.string({ message: 'Data/hora de início obrigatória' }).min(1, 'Data/hora de início obrigatória'),
  dataTerminoEfetivo: z.string({ message: 'Data/hora de término obrigatória' }).min(1, 'Data/hora de término obrigatória'),
  observacoesFinais: z.string().optional(),
  materiais: z
    .array(
      z.object({
        materialId: z.number(),
        quantidade: z.string(),
        tipoUso: z.enum(['comodato', 'venda', 'uso_interno']),
        localSaida: z.enum(['estoque_principal', 'estoque_tecnico']).optional().default('estoque_principal'),
      }),
    )
    .default([]),
  speedTestPing: z.number().optional(),
  speedTestDownload: z.number().optional(),
  speedTestUpload: z.number().optional(),
  speedTestDataHora: z.string().optional(),
})

export const osReagendamentoSchema = z.object({
  motivoReagendamento: z.string({ message: 'Motivo obrigatório' }).min(1, 'Motivo obrigatório'),
  novaDataAgendada: z.string({ message: 'Nova data obrigatória' }).min(1, 'Nova data obrigatória'),
  tecnicoId: z.number().optional(),
})

export const osCancelamentoSchema = z.object({
  motivoCancelamento: z.string({ message: 'Motivo obrigatório' }).min(1, 'Motivo obrigatório'),
  observacoes: z.string().optional(),
})

export type OsInput = z.input<typeof osSchema>
export type OsConclusaoInput = z.input<typeof osConclusaoSchema>
export type OsReagendamentoInput = z.input<typeof osReagendamentoSchema>
export type OsCancelamentoInput = z.input<typeof osCancelamentoSchema>
export type OsSchema = z.infer<typeof osSchema>
export type OsConclusao = z.infer<typeof osConclusaoSchema>
export type OsReagendamento = z.infer<typeof osReagendamentoSchema>
export type OsCancelamento = z.infer<typeof osCancelamentoSchema>
