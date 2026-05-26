import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { clienteSchema, type ClienteInput } from '@/features/clientes/schema'
import { createCliente } from '@/features/clientes/server'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

export function NovoClientePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { status: 'ativo', situacaoContrato: 'nao_assinado' },
  })

  const onSubmit = async (data: ClienteInput) => {
    try {
      await createCliente({ data })
      toast.success('Cliente cadastrado com sucesso!')
      await navigate({ to: '/clientes' })
    } catch (e) {
      toast.error('Erro ao cadastrar cliente')
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
            <Field label="Nome / Razão Social" required>
              <input {...register('nome')} placeholder="Nome completo ou razão social" className={inputCls} />
              {errors.nome && <p className="text-xs text-danger mt-1">{errors.nome.message}</p>}
            </Field>
            <Field label="CPF / CNPJ" required>
              <input {...register('cpfCnpj')} placeholder="000.000.000-00 ou 00.000.000/0001-00" className={inputCls} />
              {errors.cpfCnpj && <p className="text-xs text-danger mt-1">{errors.cpfCnpj.message}</p>}
            </Field>
            <Field label="Telefone" required>
              <input {...register('telefone')} placeholder="(44) 99999-0000" className={inputCls} />
              {errors.telefone && <p className="text-xs text-danger mt-1">{errors.telefone.message}</p>}
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
              <input {...register('cep')} placeholder="00000-000" className={inputCls} maxLength={9} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Logradouro">
                <input {...register('logradouro')} placeholder="Rua, Avenida..." className={inputCls} />
              </Field>
            </div>
            <Field label="Número">
              <input {...register('numero')} placeholder="123" className={inputCls} />
            </Field>
            <Field label="Complemento">
              <input {...register('complemento')} placeholder="Apto, Sala..." className={inputCls} />
            </Field>
            <Field label="Bairro">
              <input {...register('bairro')} placeholder="Bairro" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Cidade">
                <input {...register('cidade')} placeholder="Cidade" className={inputCls} />
              </Field>
            </div>
            <Field label="UF">
              <input {...register('uf')} placeholder="PR" maxLength={2} className={inputCls} />
            </Field>
          </div>
          <Field label="Referência">
            <input {...register('referencia')} placeholder="Próximo ao mercado, portão azul..." className={inputCls} />
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
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/clientes' })} />
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
