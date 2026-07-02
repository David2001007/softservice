import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { getClienteSchema } from '@/features/clientes/schema'
import type { ClienteInput } from '@/features/clientes/schema'
import { updateCliente, deleteCliente } from '@/features/clientes/server'
import { applyPhoneMask, applyCepMask, applyCpfCnpjMask } from '@/lib/utils'

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

export function EditarClientePage({
  clienteData,
  id,
  configMap,
}: {
  clienteData: any
  id: string
  configMap: Record<string, string>
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
    values: clienteData
      ? {
          nome: clienteData.nome,
          cpfCnpj: applyCpfCnpjMask(clienteData.cpfCnpj ?? ''),
          telefone: applyPhoneMask(clienteData.telefone ?? ''),
          cidade: clienteData.cidade || '',
          uf: clienteData.uf || '',
          status: clienteData.status,
          situacaoContrato: clienteData.situacaoContrato,
          plano: clienteData.plano || '',
          cep: applyCepMask(clienteData.cep ?? ''),
          logradouro: clienteData.logradouro || '',
          numero: clienteData.numero || '',
          complemento: clienteData.complemento || '',
          bairro: clienteData.bairro || '',
          referencia: clienteData.referencia || '',
        }
      : undefined,
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCliente({ data: Number(id) })
      toast.success('Cliente excluído com sucesso!')
      navigate({ to: '/clientes' })
    } catch {
      toast.error('Erro ao excluir cliente')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!clienteData) return null

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar Cliente #${id}`}
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
        <FormSection title="Dados Principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nome / Razão Social"
              required
              error={errors.nome?.message}
            >
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
            <Field label="CEP" error={errors.cep?.message}>
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
                placeholder="UF"
                maxLength={2}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Referência">
            <input
              {...register('referencia')}
              placeholder="Ponto de referência"
              className={inputCls}
            />
          </Field>
        </FormSection>

        <FormSection title="Dados do Contrato">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Plano">
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

        <div className="flex items-center justify-between pt-2">
          <DefaultButton
            variant="outline"
            leftIcon={<Trash2 className="w-4 h-4" />}
            label="Excluir Cliente"
            className="text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setShowDeleteModal(true)}
          />
          <div className="flex items-center gap-3">
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
              label="Salvar Alterações"
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </form>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${clienteData.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
