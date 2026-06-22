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

interface MaterialLinha {
  id: string
  materialId: number
  quantidade: string
  tipoUso: 'comodato' | 'venda' | 'uso_interno'
  localSaida: 'estoque_principal' | 'estoque_tecnico'
}

interface ConclusaoFormProps {
  osId: number | string
  onSubmit: (data: OsConclusaoInput) => Promise<void>
  isLoading: boolean
  materiaisCatalogo: Array<{ id: number; codigo: string; descricao: string }>
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
}: ConclusaoFormProps) {
  const cacheKey = `${CACHE_KEY_PREFIX}${osId}`
  const [searchMaterial, setSearchMaterial] = useState('')
  const [openMaterialId, setOpenMaterialId] = useState<string | null>(null)
  const [showSpeedTest, setShowSpeedTest] = useState(false)

  // Load from cache on mount
  const initialData = useMemo(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      return JSON.parse(cached) as ConclusaoCache
    }
    return null
  }, [cacheKey])

  const [materiais, setMateriais] = useState<MaterialLinha[]>(() => {
    if (initialData?.materiais) {
      return initialData.materiais.map((mat) => ({
        ...mat,
        id: `mat-${Date.now()}-${Math.random()}`,
      }))
    }
    return []
  })
  const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResults | null>(initialData?.speedTestResults || null)

  const form = useForm<OsConclusaoInput>({
    resolver: zodResolver(osConclusaoSchema),
    defaultValues: initialData?.formData || { materiais: [] },
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
        localSaida: 'estoque_principal',
      },
    ])
  }

  const removeMaterial = (id: string) => {
    setMateriais((m) => m.filter((item) => item.id !== id))
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      materiais,
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

  if (showSpeedTest) {
    return (
      <SpeedTest
        initialResults={speedTestResults}
        onConfirm={(results) => {
          setSpeedTestResults(results)
          setShowSpeedTest(false)
        }}
        onCancel={() => setShowSpeedTest(false)}
      />
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

              <Input
                type="number"
                step="0.001"
                placeholder="Qtd."
                value={m.quantidade}
                onChange={(e) =>
                  setMateriais((prev) =>
                    prev.map((x) =>
                      x.id === m.id ? { ...x, quantidade: e.target.value } : x,
                    ),
                  )
                }
              />

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
                <Select
                  value={m.localSaida}
                  onValueChange={(value) =>
                    setMateriais((prev) =>
                      prev.map((x) =>
                        x.id === m.id
                          ? {
                              ...x,
                              localSaida: value as MaterialLinha['localSaida'],
                            }
                          : x,
                      ),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estoque_principal">
                      Est. Principal
                    </SelectItem>
                    <SelectItem value="estoque_tecnico">
                      Est. Técnico
                    </SelectItem>
                  </SelectContent>
                </Select>
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

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        {speedTestResults ? (
          <div className="flex-1 flex gap-3 text-xs font-medium text-muted-foreground items-center bg-muted/50 py-1.5 px-3 rounded-lg w-max border border-border/50">
            <span className="text-green-500 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> Teste OK
            </span>
            <div className="w-px h-3 bg-border" />
            <span>Ping: {speedTestResults.ping}ms</span>
            <div className="w-px h-3 bg-border" />
            <span>↓ {speedTestResults.download}Mbps</span>
            <div className="w-px h-3 bg-border" />
            <span>↑ {speedTestResults.upload}Mbps</span>
          </div>
        ) : null}
        <DefaultButton
          type="button"
          label={speedTestResults ? 'Refazer Teste' : 'Testar Conexão'}
          leftIcon={<Wifi className="w-4 h-4" />}
          onClick={() => setShowSpeedTest(true)}
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
