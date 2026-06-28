import { FileText, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react'
import { DefaultButton } from '@/components/default-button'
import { toast } from 'sonner'
import { deleteOsArquivo } from '../server'

interface Arquivo {
  id: number
  nome: string
  tipoArquivo: string
  arquivoUrl: string | null
  createdAt: string
}

interface ArquivoListProps {
  arquivos: Arquivo[]
  onArquivoDeleted?: (id: number) => void
  showDelete?: boolean
}

export function ArquivoList({ arquivos, onArquivoDeleted, showDelete = true }: ArquivoListProps) {
  const handleDelete = async (id: number) => {
    try {
      await deleteOsArquivo({ data: id })
      toast.success('Arquivo excluído com sucesso!')
      onArquivoDeleted?.(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir arquivo')
    }
  }

  if (arquivos.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        Nenhum arquivo anexado
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {arquivos.map((arquivo) => (
        <div
          key={arquivo.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-surface border border-border rounded-lg gap-2"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {arquivo.tipoArquivo === 'imagem' ? (
              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{arquivo.nome}</p>
              <p className="text-xs text-text-muted">
                {new Date(arquivo.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 self-stretch sm:self-auto">
            {arquivo.arquivoUrl && (
              <a
                href={arquivo.arquivoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
              >
                <DefaultButton
                  variant="ghost"
                  size="sm"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  label="Abrir"
                />
              </a>
            )}
            {showDelete && (
              <DefaultButton
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                label=""
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(arquivo.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
