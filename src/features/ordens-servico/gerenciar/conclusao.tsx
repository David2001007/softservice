import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Wifi } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DefaultButton } from '@/components/default-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  osConclusaoSchema
  
} from '@/features/ordens-servico/schema'
import type {OsConclusaoInput} from '@/features/ordens-servico/schema';
import { SpeedTest  } from './speed-test'
import type {SpeedTestResults} from './speed-test';
import { formatDate, formatNumber, getEstoqueUnidadeLabel } from '@/lib/utils'
import { SpeedTestDisplay, parseSpeedTestFromOs } from '../components/SpeedTestDisplay'
import { salvarSpeedTestOs } from '@/features/ordens-servico/server'
import { toast } from 'sonner'

function toDatetimeLocalValue(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

/**
 * Converte o valor de um <input type="datetime-local"> ("YYYY-MM-DDTHH:mm", sem fuso)
 * para uma string ISO com offset fixo de Brasília (-03:00).
 * Sem isso, o servidor interpreta o valor como UTC e salva 3 horas a mais.
 */
function toISOWithBROffset(datetimeLocal: string): string {
  if (!datetimeLocal) return datetimeLocal
  // Garante que tem segundos antes de adicionar o offset
  const normalized = datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal
  return `${normalized}-03:00`
}

interface MaterialLinha {
  id: string
  materialId: number
  quantidade: string
  tipoUso: 'comodato' | 'venda' | 'uso_interno'
}

interface ConclusaoFormProps {
  osId: number | string
  onSubmit: (data: OsConclusaoInput) => Promise<void>
  isLoading: boolean
  materiaisCatalogo: Array<{ id: number; codigo: string; descricao: string; quantidade?: string | number; unidade?: string }>
  materiaisExistentes?: Array<{
    id: number
    materialId: number
    quantidade: string
    tipoUso: 'comodato' | 'venda' | 'uso_interno'
  }>
  osSalva?: {
    speedTestPing?: string | number | null
    speedTestDownload?: string | number | null
    speedTestUpload?: string | number | null
    speedTestDataHora?: string | Date | null
    dataInicioEfetivo?: string | Date | null
    dataTerminoEfetivo?: string | Date | null
    observacoesFinais?: string | null
  } | null
  readOnly?: boolean
}

interface ConclusaoCache {
  formData: Partial<OsConclusaoInput>
  materiais: Array<Omit<MaterialLinha, 'id'>>
  speedTestResults: SpeedTestResults | null
}

const CACHE_KEY_PREFIX = 'os-gerenciar-conclusao-'

export function ConclusaoForm({
  osId,
  onSubmit,
  isLoading,
  materiaisCatalogo,
  materiaisExistentes,
  osSalva,
  readOnly = false,
}: ConclusaoFormProps) {
  const cacheKey = `${CACHE_KEY_PREFIX}${osId}`
  const [searchMaterial, setSearchMaterial] = useState('')
  const [openMaterialId, setOpenMaterialId] = useState<string | null>(null)
  const [showSpeedTest, setShowSpeedTest] = useState(false)
  const [isSavingSpeedTest, setIsSavingSpeedTest] = useState(false)

  const savedSpeedTest = useMemo(
    () => (osSalva ? parseSpeedTestFromOs(osSalva) : null),
    [osSalva],
  )

  // Load from cache on mount
  const initialData = useMemo(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      return JSON.parse(cached) as ConclusaoCache
    }
    return null
  }, [cacheKey])

  const [materiais, setMateriais] = useState<MaterialLinha[]>(() => {
    if (initialData?.materiais && initialData.materiais.length > 0) {
      return initialData.materiais.map((mat) => ({
        ...mat,
        id: `mat-${Date.now()}-${Math.random()}`,
      }))
    }
    if (materiaisExistentes && materiaisExistentes.length > 0) {
      return materiaisExistentes.map((mat) => ({
        id: `mat-${mat.id}-${Date.now()}`,
        materialId: mat.materialId,
        quantidade: mat.quantidade,
        tipoUso: mat.tipoUso,
      }))
    }
    return []
  })
  const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResults | null>(
    initialData?.speedTestResults ?? savedSpeedTest ?? null,
  )

  const form = useForm<OsConclusaoInput>({
    resolver: zodResolver(osConclusaoSchema),
    defaultValues: initialData?.formData || {
      materiais: [],
      dataInicioEfetivo: toDatetimeLocalValue(osSalva?.dataInicioEfetivo),
      dataTerminoEfetivo: toDatetimeLocalValue(osSalva?.dataTerminoEfetivo),
      observacoesFinais: osSalva?.observacoesFinais ?? '',
    },
  })

  // Save to cache whenever data changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      const { materiais: _, ...formDataWithoutMateriais } = data
      const cacheData: ConclusaoCache = {
        formData: formDataWithoutMateriais as Partial<OsConclusaoInput>,
        materiais: materiais.filter(m => m.materialId > 0).map(({ id, ...rest }) => rest),
        speedTestResults,
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    })
    return () => subscription.unsubscribe()
  }, [form, cacheKey, materiais, speedTestResults])

  // Update cache when materiais or speedTestResults change
  useEffect(() => {
    const { materiais: _, ...formDataWithoutMateriais } = form.getValues()
    const cacheData: ConclusaoCache = {
      formData: formDataWithoutMateriais as Partial<OsConclusaoInput>,
      materiais: materiais.filter(m => m.materialId > 0).map(({ id, ...rest }) => rest),
      speedTestResults,
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  }, [materiais, speedTestResults, form, cacheKey])

  const filteredMateriais = useMemo(() => {
    if (!searchMaterial) return materiaisCatalogo
    return materiaisCatalogo.filter(
      (m) =>
        m.descricao.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        m.codigo.toLowerCase().includes(searchMaterial.toLowerCase()),
    )
  }, [searchMaterial, materiaisCatalogo])

  const addMaterial = () => {
    setMateriais((m) => [
      ...m,
      {
        id: `mat-${Date.now()}`,
        materialId: 0,
        quantidade: '1',
        tipoUso: 'uso_interno',
      },
    ])
  }

  const removeMaterial = (id: string) => {
    setMateriais((m) => m.filter((item) => item.id !== id))
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    const materiaisValidos = materiais
      .filter((m) => m.materialId > 0)
      .map(({ id: _, ...rest }) => rest)

    await onSubmit({
      ...data,
      // Converter datetime-local (sem fuso) para ISO com offset de Brasília
      dataInicioEfetivo: data.dataInicioEfetivo
        ? toISOWithBROffset(data.dataInicioEfetivo)
        : data.dataInicioEfetivo,
      dataTerminoEfetivo: data.dataTerminoEfetivo
        ? toISOWithBROffset(data.dataTerminoEfetivo)
        : data.dataTerminoEfetivo,
      materiais: materiaisValidos,
      ...(speedTestResults
        ? {
            speedTestPing: speedTestResults.ping,
            speedTestDownload: speedTestResults.download,
            speedTestUpload: speedTestResults.upload,
            speedTestDataHora: speedTestResults.dataHora,
          }
        : {}),
    })
  })

  const handleSpeedTestConfirm = async (results: SpeedTestResults) => {
    setSpeedTestResults(results)
    setShowSpeedTest(false)

    try {
      setIsSavingSpeedTest(true)
      await salvarSpeedTestOs({
        data: {
          id: Number(osId),
          speedTestPing: results.ping,
          speedTestDownload: results.download,
          speedTestUpload: results.upload,
          speedTestDataHora: results.dataHora,
        },
      })
      toast.success('Teste de conexão salvo!')
    } catch {
      toast.error('Erro ao salvar teste de conexão')
    } finally {
      setIsSavingSpeedTest(false)
    }
  }

  if (showSpeedTest && !readOnly) {
    return (
      <SpeedTest
        initialResults={speedTestResults}
        onConfirm={handleSpeedTestConfirm}
        onCancel={() => setShowSpeedTest(false)}
      />
    )
  }

  if (readOnly) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Início Efetivo</p>
            <p className="text-sm mt-0.5">
              {formatDate(osSalva?.dataInicioEfetivo, { time: true })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Término Efetivo</p>
            <p className="text-sm mt-0.5">
              {formatDate(osSalva?.dataTerminoEfetivo, { time: true })}
            </p>
          </div>

        </div>
        {osSalva?.observacoesFinais && (
          <div>
            <p className="text-xs text-muted-foreground font-medium">Observações Finais</p>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">{osSalva.observacoesFinais}</p>
          </div>
        )}
        {materiaisExistentes && materiaisExistentes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Materiais Utilizados</p>
            {materiaisExistentes.map((mat) => {
              const material = materiaisCatalogo.find((m) => m.id === mat.materialId)
              return (
                <div
                  key={mat.id}
                  className="p-3 rounded-lg bg-muted border border-border text-sm"
                >
                  {material
                    ? `${material.descricao} (${material.codigo})`
                    : `Material #${mat.materialId}`}
                  {' — '}
                  Qtd: {formatNumber(mat.quantidade)} | Tipo: {mat.tipoUso}
                </div>
              )
            })}
          </div>
        )}
        {(osSalva?.speedTestPing != null || speedTestResults) && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Teste de Conexão</p>
            <SpeedTestDisplay
              ping={speedTestResults?.ping ?? osSalva?.speedTestPing}
              download={speedTestResults?.download ?? osSalva?.speedTestDownload}
              upload={speedTestResults?.upload ?? osSalva?.speedTestUpload}
              dataHora={speedTestResults?.dataHora ?? osSalva?.speedTestDataHora}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data/Hora de Início Efetivo *</Label>
          <Input
            id="dataInicio"
            type="datetime-local"
            {...form.register('dataInicioEfetivo')}
            aria-invalid={!!form.formState.errors.dataInicioEfetivo}
          />
          {form.formState.errors.dataInicioEfetivo && (
            <p className="text-xs text-destructive">
              {form.formState.errors.dataInicioEfetivo.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataTermino">Data/Hora de Término Efetivo *</Label>
          <Input
            id="dataTermino"
            type="datetime-local"
            {...form.register('dataTerminoEfetivo')}
            aria-invalid={!!form.formState.errors.dataTerminoEfetivo}
          />
          {form.formState.errors.dataTerminoEfetivo && (
            <p className="text-xs text-destructive">
              {form.formState.errors.dataTerminoEfetivo.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Finais</Label>
        <Textarea
          id="observacoes"
          placeholder="Descreva o resultado do atendimento..."
          rows={3}
          {...form.register('observacoesFinais')}
        />
      </div>

      {/* Materiais Utilizados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Materiais Utilizados</h4>
          <DefaultButton
            type="button"
            size="sm"
            variant="ghost"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            label="Adicionar"
            onClick={addMaterial}
            className="h-7 text-xs"
          />
        </div>

        {materiais.length === 0 && (
          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">
            Nenhum material adicionado. Clique em "Adicionar" para registrar
            materiais utilizados.
          </p>
        )}

        {materiais.map((m) => {
          const selectedMaterial = materiaisCatalogo.find(
            (mat) => mat.id === m.materialId,
          )
          return (
            <div
              key={m.id}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted border border-border"
            >
              <Popover
                open={openMaterialId === m.id}
                onOpenChange={(open) => setOpenMaterialId(open ? m.id : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="sm:col-span-1 h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors flex items-center justify-between text-left"
                  >
                    <span className="text-sm truncate">
                      {selectedMaterial
                        ? `${selectedMaterial.descricao} (${selectedMaterial.codigo})`
                        : 'Selecione material...'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Buscar material..."
                      value={searchMaterial}
                      onChange={(e) => setSearchMaterial(e.target.value)}
                      className="h-8"
                    />
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {filteredMateriais.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Nenhum material encontrado
                        </p>
                      ) : (
                        filteredMateriais.map((mat) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => {
                              setMateriais((prev) =>
                                prev.map((x) =>
                                  x.id === m.id
                                    ? { ...x, materialId: mat.id }
                                    : x,
                                ),
                              )
                              setOpenMaterialId(null)
                              setSearchMaterial('')
                            }}
                            className="w-full text-left px-2 py-2 rounded text-sm hover:bg-muted transition-colors"
                          >
                            <div className="font-medium">{mat.descricao}</div>
                            <div className="text-xs text-muted-foreground">
                              {mat.codigo}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="space-y-1.5">
                <Input
                  type="number"
                  step={selectedMaterial?.unidade === 'M' ? '0.001' : '1'}
                  min="0"
                  placeholder={selectedMaterial?.unidade === 'M' ? 'Qtd. (metros)' : 'Qtd.'}
                  value={m.quantidade}
                  onChange={(e) =>
                    setMateriais((prev) =>
                      prev.map((x) =>
                        x.id === m.id ? { ...x, quantidade: e.target.value } : x,
                      ),
                    )
                  }
                />
                {selectedMaterial && (
                  <p className="text-[11px] text-muted-foreground">
                    Disponível: {formatNumber(selectedMaterial.quantidade ?? 0)} {getEstoqueUnidadeLabel(selectedMaterial)}
                  </p>
                )}
              </div>

              <Select
                value={m.tipoUso}
                onValueChange={(value) =>
                  setMateriais((prev) =>
                    prev.map((x) =>
                      x.id === m.id
                        ? { ...x, tipoUso: value as MaterialLinha['tipoUso'] }
                        : x,
                    ),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uso_interno">Uso Interno</SelectItem>
                  <SelectItem value="comodato">Comodato</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => removeMaterial(m.id)}
                  className="w-10 h-9 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
        {(speedTestResults || osSalva?.speedTestPing != null) ? (
          <SpeedTestDisplay
            compact
            ping={speedTestResults?.ping ?? osSalva?.speedTestPing}
            download={speedTestResults?.download ?? osSalva?.speedTestDownload}
            upload={speedTestResults?.upload ?? osSalva?.speedTestUpload}
            dataHora={speedTestResults?.dataHora ?? osSalva?.speedTestDataHora}
          />
        ) : null}
        <DefaultButton
          type="button"
          label={speedTestResults || osSalva?.speedTestPing != null ? 'Refazer Teste' : 'Testar Conexão'}
          leftIcon={<Wifi className="w-4 h-4" />}
          onClick={() => setShowSpeedTest(true)}
          isLoading={isSavingSpeedTest}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        />
        <DefaultButton
          type="submit"
          isLoading={isLoading}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          label="Confirmar Conclusão"
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
        />
      </div>
    </form>
  )
}
