import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Settings, Wifi } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { ArquivoList } from '../components/ArquivoList'
import { SpeedTestDisplay } from '../components/SpeedTestDisplay'
import { formatDate, formatNumber, getEstoqueUnidadeLabel } from '@/lib/utils'

const tipoServicoLabel: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  troca_equipamento: 'Troca de Equipamento',
  infra: 'Infraestrutura',
  outro: 'Outro',
}

const tipoUsoLabel: Record<string, string> = {
  uso_interno: 'Uso Interno',
  comodato: 'Comodato',
  venda: 'Venda',
}

const localSaidaLabel: Record<string, string> = {
  estoque_principal: 'Estoque Principal',
  estoque_tecnico: 'Estoque Técnico',
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm text-text mt-0.5 break-words">{value || '—'}</div>
    </div>
  )
}

export function VerOrdemServicoPage({ os, id }: { os: any; id: string }) {
  const navigate = useNavigate()

  if (!os) return null

  const cliente = typeof os.cliente === 'object' ? os.cliente : null
  const endereco = cliente
    ? [cliente.logradouro, cliente.numero, cliente.bairro, cliente.cidade]
        .filter(Boolean)
        .join(', ')
    : os.endereco || '—'

  const isConcluida = os.status === 'concluida'
  const isCancelada = os.status === 'cancelada'
  const hasSpeedTest = os.speedTestDownload != null || os.speedTestUpload != null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-5 fade-in">
      <PageHeader
        title={`Ordem de Serviço #${os.numero}`}
        action={
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <DefaultButton
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              label="Voltar"
              onClick={() => navigate({ to: '/ordens-servico' })}
              className="w-full sm:w-auto"
            />
            <Link to="/ordens-servico/$id/gerenciar" params={{ id }}>
              <DefaultButton
                label="Gerenciar OS"
                leftIcon={<Settings className="w-4 h-4" />}
                className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 w-full sm:w-auto"
              />
            </Link>
          </div>
        }
      />

      <Section title="Informações Gerais">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <DetailItem label="Número OS" value={os.numero} />
          <DetailItem
            label="Status"
            value={<StatusBadge value={os.status} type="os" />}
          />
          <DetailItem label="Cliente" value={cliente?.nome ?? os.cliente} />
          <DetailItem
            label="CPF/CNPJ"
            value={cliente?.cpfCnpj ?? os.cpfCnpj}
          />
          <DetailItem label="Endereço" value={endereco} />
          <DetailItem
            label="Tipo de Serviço"
            value={tipoServicoLabel[os.tipoServico] ?? os.tipoServico}
          />
          <DetailItem
            label="Prioridade"
            value={<StatusBadge value={os.prioridade} type="prioridade" />}
          />
          <DetailItem
            label="Técnico"
            value={
              typeof os.tecnico === 'object'
                ? os.tecnico?.nome
                : os.tecnico || 'Não atribuído'
            }
          />
          <DetailItem
            label="Abertura"
            value={formatDate(os.dataAbertura, { time: true })}
          />
          <DetailItem
            label="Agendamento"
            value={
              os.dataAgendada
                ? formatDate(os.dataAgendada, { time: true })
                : 'Não agendado'
            }
          />
          {os.valor != null && os.valor !== '' && (
            <DetailItem
              label="Valor"
              value={`R$ ${formatNumber(os.valor, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          )}
        </div>
      </Section>

      <Section title="Descrição do Problema">
        <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words">
          {os.descricaoProblema || '—'}
        </p>
      </Section>

      {os.observacoes && (
        <Section title="Observações">
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words">
            {os.observacoes}
          </p>
        </Section>
      )}

      {isConcluida && (
        <Section title="Conclusão do Atendimento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem
              label="Início Efetivo"
              value={formatDate(os.dataInicioEfetivo, { time: true })}
            />
            <DetailItem
              label="Término Efetivo"
              value={formatDate(os.dataTerminoEfetivo, { time: true })}
            />
            {os.resultadoServico != null && (
              <DetailItem
                label="Resultado"
                value={os.resultadoServico ? 'Sucesso' : 'Insucesso'}
              />
            )}
          </div>
          {os.observacoesFinais && (
            <div className="mt-4 pt-4 border-t border-border">
              <DetailItem
                label="Observações Finais"
                value={
                  <p className="whitespace-pre-wrap">{os.observacoesFinais}</p>
                }
              />
            </div>
          )}
        </Section>
      )}

      {hasSpeedTest && (
        <Section title="Teste de Conexão">
          <div className="flex items-center gap-2 mb-4 text-green-500">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Resultado registrado</span>
          </div>
          <SpeedTestDisplay
            download={os.speedTestDownload}
            upload={os.speedTestUpload}
            dataHora={os.speedTestDataHora}
          />
        </Section>
      )}

      {os.motivoReagendamento && (
        <Section title="Reagendamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem label="Motivo" value={os.motivoReagendamento} />
            <DetailItem
              label="Nova Data"
              value={
                os.novaDataAgendada
                  ? formatDate(os.novaDataAgendada, { time: true })
                  : '—'
              }
            />
          </div>
        </Section>
      )}

      {isCancelada && (
        <Section title="Cancelamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem label="Motivo" value={os.motivoCancelamento} />
            <DetailItem
              label="Data do Cancelamento"
              value={formatDate(os.dataCancelamento, { time: true })}
            />
          </div>
        </Section>
      )}

      {os.materiais && os.materiais.length > 0 && (
        <Section title="Materiais Utilizados">
          <div className="space-y-2">
            {os.materiais.map((mat: any) => (
              <div
                key={mat.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border"
              >
                <div>
                  <p className="text-sm font-medium">
                    {mat.material?.descricao} ({mat.material?.codigo})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qtd: {formatNumber(mat.quantidade)}{' '}
                    {getEstoqueUnidadeLabel(mat.material)} | Tipo:{' '}
                    {tipoUsoLabel[mat.tipoUso] ?? mat.tipoUso} | Local:{' '}
                    {localSaidaLabel[mat.localSaida] ?? mat.localSaida}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={`Arquivos Anexados (${(os.arquivos || []).length}/5)`}>
        <ArquivoList arquivos={os.arquivos || []} showDelete={false} />
      </Section>
    </div>
  )
}
