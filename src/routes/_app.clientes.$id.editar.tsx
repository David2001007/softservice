import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { clienteSchema, type ClienteInput } from '@/features/clientes/schema'
import { getCliente, updateCliente } from '@/features/clientes/server'

export const Route = createFileRoute('/_app/clientes/$id/editar')({
  loader: async ({ params }) => await getCliente({ data: Number(params.id) }),
  component: EditarClientePage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}{required && <span className="text-danger ml-1">*</span>}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  )
}

function EditarClientePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/clientes/$id/editar' })
  const clienteData = Route.useLoaderData()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: clienteData ? {
      nome: clienteData.nome,
      cpfCnpj: clienteData.cpfCnpj,
      telefone: clienteData.telefone,
      cidade: clienteData.cidade || '',
      uf: clienteData.uf || '',
      status: clienteData.status as any,
      situacaoContrato: clienteData.situacaoContrato as any,
      plano: clienteData.plano || '',
      cep: clienteData.cep || '',
      logradouro: clienteData.logradouro || '',
      numero: clienteData.numero || '',
      complemento: clienteData.complemento || '',
      bairro: clienteData.bairro || '',
      referencia: clienteData.referencia || '',
    } : {},
  })

  const onSubmit = async (data: ClienteInput) => {
    try {
      await updateCliente({ data: { id: Number(id), data } })
      toast.success('Cliente atualizado com sucesso!')
      await navigate({ to: '/clientes' })
    } catch (e) {
      toast.error('Erro ao atualizar cliente')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar Cliente #${id}`}
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/clientes' })} />}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Dados Principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome / Razão Social" required error={errors.nome?.message}>
              <input {...register('nome')} className={inputCls} />
            </Field>
            <Field label="CPF / CNPJ" required error={errors.cpfCnpj?.message}>
              <input {...register('cpfCnpj')} className={inputCls} />
            </Field>
            <Field label="Telefone" required error={errors.telefone?.message}>
              <input {...register('telefone')} className={inputCls} />
            </Field>
            <Field label="Status">
              <select {...register('status')} className={selectCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Endereço">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CEP"><input {...register('cep')} className={inputCls} /></Field>
            <div className="sm:col-span-2"><Field label="Logradouro"><input {...register('logradouro')} className={inputCls} /></Field></div>
            <Field label="Número"><input {...register('numero')} className={inputCls} /></Field>
            <Field label="Complemento"><input {...register('complemento')} className={inputCls} /></Field>
            <Field label="Bairro"><input {...register('bairro')} className={inputCls} /></Field>
            <div className="sm:col-span-2"><Field label="Cidade"><input {...register('cidade')} className={inputCls} /></Field></div>
            <Field label="UF"><input {...register('uf')} maxLength={2} className={inputCls} /></Field>
          </div>
          <Field label="Referência"><input {...register('referencia')} className={inputCls} /></Field>
        </FormSection>
        <FormSection title="Dados do Contrato">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Plano">
              <select {...register('plano')} className={selectCls}>
                <option value="">Selecione</option>
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
        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/clientes' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} loadingText="Salvando..." leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
