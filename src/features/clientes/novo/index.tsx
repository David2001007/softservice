import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { getClienteSchema } from '@/features/clientes/schema'
import type { ClienteInput } from '@/features/clientes/schema'
import { createCliente } from '@/features/clientes/server'
import { applyPhoneMask, applyCepMask, applyCpfCnpjMask } from '@/lib/utils'

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

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
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

export function NovoClientePage({ configMap }: { configMap: Record<string, string> }) {
  const navigate = useNavigate()
  
  const obrigarCpfCnpj = configMap['obrigar_cpf_cnpj'] === 'true'
  const validarCpfCnpj = configMap['validar_cpf_cnpj'] === 'true'
  const obrigarTelefone = configMap['obrigar_telefone'] === 'true'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClienteInput>({
    resolver: zodResolver(getClienteSchema({ obrigarCpfCnpj, validarCpfCnpj, obrigarTelefone })),
    defaultValues: { status: 'ativo', situacaoContrato: 'nao_assinado' },
  })

  const onSubmit = async (data: ClienteInput) => {
    try {
      await createCliente({ data })
      toast.success('Cliente cadastrado com sucesso!')
      await navigate({ to: '/clientes' })
    } catch (e) {
      console.error(e)
      toast.error('Erro ao cadastrar cliente. Verifique os dados.')
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCepMask(e.target.value)
    e.target.value = masked
    setValue('cep', masked, { shouldValidate: true })

    if (masked.length === 9) {
      try {
        const cepOnly = masked.replace(/\D/g, '')
        const res = await fetch(`https://viacep.com.br/ws/${cepOnly}/json/`)
        const data = await res.json()
        if (data.erro) {
          toast.error('CEP não encontrado!')
          return
        }
        
        if (data.logradouro) setValue('logradouro', data.logradouro, { shouldValidate: true })
        if (data.bairro) setValue('bairro', data.bairro, { shouldValidate: true })
        if (data.localidade) setValue('cidade', data.localidade, { shouldValidate: true })
        if (data.uf) setValue('uf', data.uf, { shouldValidate: true })
        
        toast.success('Endereço preenchido pelo CEP!')
      } catch (err) {
        toast.error('Erro ao buscar o CEP')
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Cliente"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/clientes' })}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dados principais */}
        <FormSection title="Dados Principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome / Razão Social" required error={errors.nome?.message}>
              <input
                {...register('nome')}
                placeholder="Nome completo ou razão social"
                className={inputCls}
              />
            </Field>
            <Field label="CPF / CNPJ" required={obrigarCpfCnpj} error={errors.cpfCnpj?.message}>
              <input
                {...register('cpfCnpj')}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                className={inputCls}
                maxLength={18}
                onChange={(e) => {
                  const masked = applyCpfCnpjMask(e.target.value)
                  e.target.value = masked
                  setValue('cpfCnpj', masked, { shouldValidate: true })
                }}
              />
            </Field>
            <Field label="Telefone" required={obrigarTelefone} error={errors.telefone?.message}>
              <input
                {...register('telefone')}
                placeholder="(44) 99999-0000"
                className={inputCls}
                maxLength={15}
                onChange={(e) => {
                  const masked = applyPhoneMask(e.target.value)
                  e.target.value = masked
                  setValue('telefone', masked, { shouldValidate: true })
                }}
              />
              {errors.telefone && (
                <p className="text-xs text-danger mt-1">
                  {errors.telefone.message}
                </p>
              )}
            </Field>
            <Field label="Status">
              <select {...register('status')} className={selectCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Endereço */}
        <FormSection title="Endereço">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CEP">
              <input
                {...register('cep')}
                placeholder="00000-000"
                className={inputCls}
                maxLength={9}
                onChange={handleCepChange}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Logradouro">
                <input
                  {...register('logradouro')}
                  placeholder="Rua, Avenida..."
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Número">
              <input
                {...register('numero')}
                placeholder="123"
                className={inputCls}
              />
            </Field>
            <Field label="Complemento">
              <input
                {...register('complemento')}
                placeholder="Apto, Sala..."
                className={inputCls}
              />
            </Field>
            <Field label="Bairro">
              <input
                {...register('bairro')}
                placeholder="Bairro"
                className={inputCls}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Cidade">
                <input
                  {...register('cidade')}
                  placeholder="Cidade"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="UF">
              <input
                {...register('uf')}
                placeholder="PR"
                maxLength={2}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Referência">
            <input
              {...register('referencia')}
              placeholder="Próximo ao mercado, portão azul..."
              className={inputCls}
            />
          </Field>
        </FormSection>

        {/* Contrato */}
        <FormSection title="Dados do Contrato">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Plano Contratado">
              <select {...register('plano')} className={selectCls}>
                <option value="">Selecione o plano</option>
                <option value="100mb">100 Mbps</option>
                <option value="150mb">150 Mbps</option>
                <option value="200mb">200 Mbps</option>
                <option value="300mb">300 Mbps</option>
                <option value="500mb">500 Mbps</option>
                <option value="1gb">1 Gbps</option>
              </select>
            </Field>
            <Field label="Situação do Contrato">
              <select {...register('situacaoContrato')} className={selectCls}>
                <option value="assinado">Assinado</option>
                <option value="nao_assinado">Não Assinado</option>
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton
            variant="ghost"
            label="Cancelar"
            onClick={() => navigate({ to: '/clientes' })}
          />
          <DefaultButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Salvando..."
            leftIcon={<Save className="w-4 h-4" />}
            label="Salvar Cliente"
            className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </div>
  )
}
