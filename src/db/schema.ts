import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/* ── Enums ── */
export const userRoleEnum = pgEnum('user_role', ['admin', 'atendente'])
export const tecnicoTipoEnum = pgEnum('tecnico_tipo', ['interno', 'terceiro'])
export const tecnicoPerfilEnum = pgEnum('tecnico_perfil', ['tecnico', 'supervisor'])
export const clienteStatusEnum = pgEnum('cliente_status', ['ativo', 'inativo'])
export const contratoSituacaoEnum = pgEnum('contrato_situacao', ['assinado', 'nao_assinado'])
export const materialStatusEnum = pgEnum('material_status', ['ativo', 'inativo'])
export const tipoUsoMaterialEnum = pgEnum('tipo_uso_material', ['comodato', 'venda', 'uso_interno'])
export const localSaidaEnum = pgEnum('local_saida', ['estoque_principal', 'estoque_tecnico'])
export const osStatusEnum = pgEnum('os_status', [
  'aberta',
  'agendada',
  'em_execucao',
  'concluida',
  'cancelada',
  'reagendada',
  'pendente',
])
export const osPrioridadeEnum = pgEnum('os_prioridade', ['baixa', 'normal', 'alta'])
export const osTipoServicoEnum = pgEnum('os_tipo_servico', [
  'instalacao',
  'manutencao',
  'troca_equipamento',
  'infra',
  'outro',
])
export const osAcaoHistoricoEnum = pgEnum('os_acao_historico', [
  'criacao',
  'agendamento',
  'mudanca_tecnico',
  'reagendamento',
  'cancelamento',
  'conclusao',
  'atualizacao',
])

/* ── Users (atendentes / admin) ── */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('atendente'),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ── Clientes ── */
export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  nome: text('nome').notNull(),
  cpfCnpj: text('cpf_cnpj').notNull().unique(),
  telefone: text('telefone').notNull(),
  cep: text('cep'),
  logradouro: text('logradouro'),
  numero: text('numero'),
  complemento: text('complemento'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  uf: text('uf'),
  referencia: text('referencia'),
  plano: text('plano'),
  situacaoContrato: contratoSituacaoEnum('situacao_contrato').default('nao_assinado'),
  status: clienteStatusEnum('status').notNull().default('ativo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ── Técnicos ── */
export const tecnicos = pgTable('tecnicos', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  nome: text('nome').notNull(),
  tipo: tecnicoTipoEnum('tipo').notNull().default('interno'),
  empresa: text('empresa'),
  cnpj: text('cnpj'),
  telefone: text('telefone').notNull(),
  email: text('email').notNull().unique(),
  regiao: text('regiao'),
  especialidade: text('especialidade'),
  perfil: tecnicoPerfilEnum('perfil').notNull().default('tecnico'),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ── Materiais ── */
export const materiais = pgTable('materiais', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  descricao: text('descricao').notNull(),
  categoria: text('categoria').notNull(),
  unidade: text('unidade').notNull(),
  quantidade: numeric('quantidade', { precision: 12, scale: 3 }).notNull().default('0'),
  estoqueMinimo: numeric('estoque_minimo', { precision: 12, scale: 3 }).notNull().default('0'),
  comodato: boolean('comodato').notNull().default(false),
  status: materialStatusEnum('status').notNull().default('ativo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ── Ordens de Serviço ── */
export const ordensServico = pgTable('ordens_servico', {
  id: serial('id').primaryKey(),
  numero: text('numero').notNull().unique(),
  dataAbertura: timestamp('data_abertura').defaultNow().notNull(),
  criadoPorId: integer('criado_por_id').references(() => users.id),
  clienteId: integer('cliente_id').notNull().references(() => clientes.id),
  tipoServico: osTipoServicoEnum('tipo_servico').notNull(),
  descricaoProblema: text('descricao_problema'),
  observacoes: text('observacoes'),
  prioridade: osPrioridadeEnum('prioridade').notNull().default('normal'),
  dataAgendada: timestamp('data_agendada'),
  tecnicoId: integer('tecnico_id').references(() => tecnicos.id),
  valor: numeric('valor', { precision: 10, scale: 2 }),
  status: osStatusEnum('status').notNull().default('aberta'),
  // Campos de conclusão
  dataInicioEfetivo: timestamp('data_inicio_efetivo'),
  dataTerminoEfetivo: timestamp('data_termino_efetivo'),
  resultadoServico: boolean('resultado_servico'),
  observacoesFinais: text('observacoes_finais'),
  // Reagendamento
  motivoReagendamento: text('motivo_reagendamento'),
  novaDataAgendada: timestamp('nova_data_agendada'),
  // Cancelamento
  motivoCancelamento: text('motivo_cancelamento'),
  responsavelCancelamentoId: integer('responsavel_cancelamento_id').references(() => users.id),
  dataCancelamento: timestamp('data_cancelamento'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ── Materiais utilizados na OS ── */
export const osMateriais = pgTable('os_materiais', {
  id: serial('id').primaryKey(),
  osId: integer('os_id').notNull().references(() => ordensServico.id, { onDelete: 'cascade' }),
  materialId: integer('material_id').notNull().references(() => materiais.id),
  quantidade: numeric('quantidade', { precision: 12, scale: 3 }).notNull(),
  tipoUso: tipoUsoMaterialEnum('tipo_uso').notNull().default('uso_interno'),
  localSaida: localSaidaEnum('local_saida').notNull().default('estoque_principal'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ── Histórico / Auditoria da OS ── */
export const osHistorico = pgTable('os_historico', {
  id: serial('id').primaryKey(),
  osId: integer('os_id').notNull().references(() => ordensServico.id, { onDelete: 'cascade' }),
  dataHora: timestamp('data_hora').defaultNow().notNull(),
  usuarioId: integer('usuario_id').references(() => users.id),
  acao: osAcaoHistoricoEnum('acao').notNull(),
  statusAnterior: osStatusEnum('status_anterior'),
  statusNovo: osStatusEnum('status_novo'),
  motivo: text('motivo'),
  detalhes: text('detalhes'),
})

/* ── Relations ── */
export const clientesRelations = relations(clientes, ({ many }) => ({
  ordensServico: many(ordensServico),
}))

export const tecnicosRelations = relations(tecnicos, ({ many }) => ({
  ordensServico: many(ordensServico),
}))

export const ordensServicoRelations = relations(ordensServico, ({ one, many }) => ({
  cliente: one(clientes, { fields: [ordensServico.clienteId], references: [clientes.id] }),
  tecnico: one(tecnicos, { fields: [ordensServico.tecnicoId], references: [tecnicos.id] }),
  criadoPor: one(users, { fields: [ordensServico.criadoPorId], references: [users.id] }),
  materiais: many(osMateriais),
  historico: many(osHistorico),
}))

export const osMateriaisRelations = relations(osMateriais, ({ one }) => ({
  os: one(ordensServico, { fields: [osMateriais.osId], references: [ordensServico.id] }),
  material: one(materiais, { fields: [osMateriais.materialId], references: [materiais.id] }),
}))

export const osHistoricoRelations = relations(osHistorico, ({ one }) => ({
  os: one(ordensServico, { fields: [osHistorico.osId], references: [ordensServico.id] }),
  usuario: one(users, { fields: [osHistorico.usuarioId], references: [users.id] }),
}))

export const passwordResetCodes = pgTable('password_reset_codes', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
