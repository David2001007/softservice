import { useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, FileText, Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DefaultButton } from '@/components/default-button'
import { toast } from 'sonner'
import { uploadOsArquivo } from '../server'

interface ArquivoItem {
  file: File
  preview: string | null
  nome: string
}

interface ArquivoUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  osId: number
  onUploadSuccess?: (arquivos: any[]) => void
}

export function ArquivoUploadModal({ open, onOpenChange, osId, onUploadSuccess }: ArquivoUploadModalProps) {
  const [arquivos, setArquivos] = useState<ArquivoItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasVideoInput = devices.some(device => device.kind === 'videoinput')
        setHasCamera(hasVideoInput)
      } catch {
        setHasCamera(false)
      }
    }
    checkCamera()
  }, [])

  const processFile = (file: File): ArquivoItem => {
    const item: ArquivoItem = {
      file,
      preview: null,
      nome: file.name.replace(/\.[^/.]+$/, '')
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setArquivos(prev => 
          prev.map(i => i.file === file ? { ...i, preview: e.target?.result as string } : i)
        )
      }
      reader.readAsDataURL(file)
    }
    return item
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newItems = files.map(processFile)
    setArquivos(prev => [...prev, ...newItems])
  }

  const handleCamera = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => handleFileSelect(e as any)
    input.click()
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (arquivos.length === 0) {
      toast.error('Selecione pelo menos um arquivo')
      return
    }

    setUploading(true)
    try {
      const arquivosProcessados = await Promise.all(
        arquivos.map(async (item) => ({
          nome: item.nome,
          arquivoBase64: await fileToBase64(item.file),
          mimeType: item.file.type,
        }))
      )

      const arquivosAtualizados = await uploadOsArquivo({
        data: {
          osId,
          arquivos: arquivosProcessados,
        },
      })
      toast.success(`${arquivos.length} arquivo(s) enviado(s) com sucesso!`)
      onOpenChange(false)
      resetForm()
      onUploadSuccess?.(arquivosAtualizados)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar arquivos')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setArquivos([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Adicionar Arquivo/Foto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Arquivo</Label>
            <div className={`grid gap-2 ${hasCamera ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
                <DefaultButton
                  variant="ghost"
                  className="w-full h-24 flex-col gap-2"
                  leftIcon={<Upload className="w-6 h-6" />}
                  label="Galeria"
                />
              </div>
              {hasCamera && (
                <DefaultButton
                  variant="ghost"
                  className="w-full h-24 flex-col gap-2"
                  leftIcon={<Camera className="w-6 h-6" />}
                  label="Câmera"
                  onClick={handleCamera}
                />
              )}
            </div>
          </div>
          {arquivos.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {arquivos.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.file.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{item.file.name}</span>
                    </div>
                    <DefaultButton
                      variant="ghost"
                      size="sm"
                      leftIcon={<X className="w-4 h-4" />}
                      label=""
                      onClick={() => removeFile(index)}
                    />
                  </div>
                  {item.preview && (
                    <img
                      src={item.preview}
                      alt="Preview"
                      className="mt-2 max-h-60 sm:max-h-40 w-full rounded object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DefaultButton
            variant="ghost"
            label="Cancelar"
            onClick={() => {
              onOpenChange(false)
              resetForm()
            }}
            className="w-full sm:w-auto"
          />
          <DefaultButton
            label="Enviar"
            onClick={handleSubmit}
            isLoading={uploading}
            disabled={arquivos.length === 0}
            className="bg-primary hover:bg-primary-hover text-white w-full sm:w-auto"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
