import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { materialSchema  } from '@/features/materiais/schema'
import type {MaterialInput} from '@/features/materiais/schema';
import { createMaterial } from '@/features/materiais/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { useAuthStore } from '@/stores/auth.store'
import { TecnicoAutocomplete } from '@/features/materiais/components/TecnicoAutocomplete'

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function NovoMaterialPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.type === 'user'
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      quantidade: '0',
      estoqueMinimo: '0',
      comodato: false,
      status: 'ativo',
      assignedTecnicoId: null,
    },
  })

  const unidade = watch('unidade')
  const isMetro = unidade === 'M'

  const onSubmit = async (data: MaterialInput) => {
    try {
      const payload = {
        ...data,
        assignedTecnicoId: data.assignedTecnicoId ? Number(data.assignedTecnicoId) : null,
      }
      await createMaterial({ data: payload })
      toast.success('Material cadastrado com sucesso!')
      await navigate({ to: '/materiais' })
    } catch (e) {
      toast.error('Erro ao cadastrar material')
    }
  }

  const [tecnicosList, setTecnicosList] = React.useState<any[]>([])
  const assignedTecnicoId = watch('assignedTecnicoId')

  useEffect(() => {
    ;(async () => {
      try {
        const t = await getTecnicos()
        setTecnicosList(t || [])
      } catch {
        // ignore
      }
    })()
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Material"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/materiais' })}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Código" required error={errors.codigo?.message}>
              <input
                {...register('codigo')}
                placeholder="Ex: MAT-001"
                className={inputCls}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Descrição"
                required
                error={errors.descricao?.message}
              >
                <input
                  {...register('descricao')}
                  placeholder="Ex: Cabo de fibra óptica SC/UPC"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Categoria" required error={errors.categoria?.message}>
              <input
                {...register('categoria')}
                placeholder="Fibra, Equipamento, Cabeamento..."
                className={inputCls}
              />
            </Field>
            <Field
              label="Unidade de Medida"
              required
              error={errors.unidade?.message}
            >
              <select {...register('unidade')} className={selectCls}>
                <option value="">Selecione...</option>
                <option value="UN">UN</option>
                <option value="CX">CX</option>
                <option value="M">M</option>
                <option value="KG">KG</option>
              </select>
              {isMetro && (
                <p className="text-xs text-text-muted mt-1">
                  Para materiais em metros, a quantidade aceita casas decimais.
                </p>
              )}
            </Field>
            <Field label="Quantidade Atual">
              <input
                {...register('quantidade')}
                type="number"
                step={isMetro ? '0.001' : '1'}
                min="0"
                placeholder={isMetro ? '0.000' : '0'}
                className={inputCls}
              />
            </Field>
            <Field label="Estoque Mínimo">
              <input
                {...register('estoqueMinimo')}
                type="number"
                step={isMetro ? '0.001' : '1'}
                min="0"
                placeholder={isMetro ? '0.000' : '0'}
                className={inputCls}
              />
            </Field>

            {/* Comodato */}
            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <input
                {...register('comodato')}
                id="comodato"
                type="checkbox"
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <div>
                <label
                  htmlFor="comodato"
                  className="text-sm font-medium text-text cursor-pointer"
                >
                  Material de comodato
                </label>
                <p className="text-xs text-text-muted">
                  Equipamento fornecido em comodato ao cliente
                </p>
              </div>
            </div>

            <Field label="Status">
              <div className="flex items-center gap-3">
                <input
                  id="statusToggle"
                  type="checkbox"
                  className="w-10 h-6 accent-primary cursor-pointer"
                  checked={watch('status') === 'ativo'}
                  onChange={(e) => setValue('status', e.target.checked ? 'ativo' : 'inativo')}
                />
                <label htmlFor="statusToggle" className="text-sm">
                  {watch('status') === 'ativo' ? 'Ativo' : 'Inativo'}
                </label>
              </div>
            </Field>

            {isAdmin && (
              <Field label="Técnico vinculado">
                <TecnicoAutocomplete
                  tecnicos={tecnicosList}
                  value={assignedTecnicoId}
                  onChange={(id) => setValue('assignedTecnicoId', id)}
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Apenas o técnico vinculado poderá visualizar e dar baixa neste material nas ordens de serviço. Sem vínculo, o material fica no estoque principal (somente administradores).
                </p>
              </Field>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <DefaultButton
            variant="ghost"
            label="Cancelar"
            onClick={() => navigate({ to: '/materiais' })}
          />
          <DefaultButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Salvando..."
            leftIcon={<Save className="w-4 h-4" />}
            label="Salvar Material"
            className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </div>
  )
}
